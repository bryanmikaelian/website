# CI and AI

When I started as a Ruby on Rails programmer in 2010, TDD was deemed the one true way to write software. RSpec was the new hotness and everyone had tests automatically run on code changes. Things were so focused on quick feedback, we even had tools like `guard` give us OSX notifications (this was back in the Snow Leopard days). It was a period of simplicity and fast iteration.

If you needed CI, Travis CI was the obvious choice. But even then, a `git push heroku main` was most likely guarded by you running tests locally. This is how you shipped Rails apps.

## A Shift

At some point, folks began to need more from CI. It turns out running `cap deploy` on your machine wasn’t a great way to deploy applications. Just because one person got nokogiri to work on their machine didn’t mean someone else did. It resulted in inconsistent deployment stories.

One of the first startups I worked at (this was circa 2012) used to operate this way. It worked great until it didn’t. And so we reached for a CI tool. For whatever reason, we went with Jenkins.

Even with Jenkins’ oddities, we ran it on an iMac with hardly any issues. It was a local machine that provided quick feedback when tests failed. If they passed, our Mac did the `cap deploy`. Now instead of “tests passed on my machine”, we were saying “tests passed on my machine but not on Jenkins”.

## The YAML Years

The gigs that followed told a different story. Engineers I worked with started spending real, soul-crushing hours on CircleCI configs and GitHub Actions workflows or GitLab CI pipelines with stages that referenced other stages. Some jobs had YAML files hundreds of lines long that nobody fully understood but everyone was afraid to touch. At 1Password, for example, the system became so convoluted that no one wanted to touch it (or own it).

It was official. CI had become its own domain of expertise. You’d have engineers whose primary contribution to the team wasn’t shipping features but allowing features *to ship.*

One of my coworkers at Librato, quite a talented engineer, embraced this role. His tasks were:

- Debugging why a test passed locally but failed in CI.
- Figuring out why the Docker layer cache invalidated.
- Tweaking parallelism settings to shave two minutes off a twenty-minute pipeline.
- Maintaining matrix builds across Ruby versions that nobody actually deployed to production.
- Porting from Travis to CircleCI.

The thing that was supposed to give us confidence had become a source of friction. PRs would sit waiting for a flaky integration test to decide whether to pass on this particular run. Developers context-switched away from the problem they were solving to go babysit a pipeline. The feedback loop that started on your own machine in 2010 now took fifteen minutes and required a browser tab you kept refreshing.

## A Different Approach

A few weeks ago, I stepped back and asked: what are we actually trying to do here? We want to know if the code is safe to deploy. That’s it. We don’t need a platform with a marketplace of orbs and actions. We don’t need YAML DSLs. We need something to run our tests and tell us if they passed.

So I built something simple on exe.dev. A small Go service that receives a GitHub webhook on a new release and writes a signal file. A systemd path unit watches for this file and kicks off the test suite. When the results come back, an AI agent analyzes them. Not just pass/fail, but actually reading the output, understanding what broke and why, and making a judgment call. If the agent deems the code safe, it triggers the deploy. No pipeline. No stages. No YAML.

Here’s the code:

```go
package common

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
)

var (
	deployMu  sync.Mutex
	deploying bool
)

// DeployTriggerPath is the file path that signals a deploy should run.
// A systemd path unit watches for this file and triggers deploy.sh as exedev.
const DeployTriggerPath = "/opt/venn/deploy.trigger"

type githubEvent struct {
	Action  string `json:"action"`
	Release struct {
		TagName string `json:"tag_name"`
		Name    string `json:"name"`
		HTMLURL string `json:"html_url"`
	} `json:"release"`
}

// DeployWebhook returns an http.HandlerFunc that handles GitHub release webhooks
// and triggers production deploys. If webhookSecret is empty, all requests are rejected.
func DeployWebhook(webhookSecret string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if webhookSecret == "" {
			http.Error(w, `{"error":"webhook secret not configured"}`, http.StatusUnauthorized)
			return
		}

		body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20)) // 1MB max
		if err != nil {
			http.Error(w, "read error", http.StatusBadRequest)
			return
		}

		// Validate HMAC signature
		sig := r.Header.Get("X-Hub-Signature-256")
		if !validDeploySignature(body, sig, webhookSecret) {
			log.Printf("invalid signature from %s", r.RemoteAddr)
			http.Error(w, "invalid signature", http.StatusUnauthorized)
			return
		}

		// Only handle release events
		eventType := r.Header.Get("X-GitHub-Event")
		if eventType != "release" {
			log.Printf("ignoring event type: %s", eventType)
			w.WriteHeader(http.StatusOK)
			fmt.Fprintf(w, `{"ignored":true,"reason":"not a release event"}`)
			return
		}

		var event githubEvent
		if err := json.Unmarshal(body, &event); err != nil {
			http.Error(w, "bad json", http.StatusBadRequest)
			return
		}

		// Only deploy on published releases
		if event.Action != "published" {
			log.Printf("ignoring release action: %s", event.Action)
			w.WriteHeader(http.StatusOK)
			fmt.Fprintf(w, `{"ignored":true,"reason":"action is %s, not published"}`, event.Action)
			return
		}

		// Check if already deploying
		deployMu.Lock()
		if deploying {
			deployMu.Unlock()
			log.Printf("deploy already in progress, rejecting")
			http.Error(w, `{"error":"deploy already in progress"}`, http.StatusConflict)
			return
		}
		deploying = true
		deployMu.Unlock()

		log.Printf("release published: %s (%s)", event.Release.TagName, event.Release.Name)

		// Write trigger file — a systemd path unit watches for this and
		// runs deploy.sh as exedev. No sudo or privilege escalation needed.
		if err := os.WriteFile(DeployTriggerPath, []byte(event.Release.TagName), 0644); err != nil {
			deployMu.Lock()
			deploying = false
			deployMu.Unlock()
			log.Printf("[deploy] failed to write trigger file: %v", err)
			http.Error(w, `{"error":"failed to trigger deploy"}`, http.StatusInternalServerError)
			return
		}

		log.Printf("[deploy] trigger file written to %s", DeployTriggerPath)

		w.WriteHeader(http.StatusAccepted)
		fmt.Fprintf(w, `{"deploying":true,"release":"%s"}`, event.Release.TagName)
	}
}

func validDeploySignature(body []byte, signature string, secret string) bool {
	if !strings.HasPrefix(signature, "sha256=") {
		return false
	}

	expected := signature[7:]
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(body)
	actual := hex.EncodeToString(mac.Sum(nil))

	return hmac.Equal([]byte(expected), []byte(actual))
}
```

The whole thing is a few hundred lines of Go and a prompt. It’s closer in spirit to that iMac running Jenkins in 2012 than anything CircleCI ever offered me. The feedback is fast. The system is something I can actually reason about. And the agent does a better job of interpreting test failures than a red X next to a step name ever did.

## This Is How We Think at exe.dev

I work at [exe.dev](https://exe.dev) now, and this way of thinking runs through everything we build. exe.dev gives you VMs, real machines with persistent disks, that start in under a second. You SSH in, you have sudo, and your services are immediately on the internet over HTTPS. No Dockerfiles. No Kubernetes manifests. No deploy pipeline to configure.

The idea is that the infrastructure should be simple enough that an agent can operate it. Spin up a VM, run your tests, evaluate the results, deploy if it’s good. The VM is the unit of computation, and it’s cheap and fast enough that you can treat it the way we used to treat our own laptops: as a place where work just happens.

When your deploy target is a machine you can SSH into, and your CI is an agent that understands your test output, you don’t need a CI platform. You need a computer and something smart enough to decide if the code is ready. We have both of those things now.

## You Don’t Need CI

Let me be more precise: you don’t need a CI *platform*. You still need to run your tests. You still need confidence before you deploy. But that confidence doesn’t have to come from a sprawling YAML pipeline managed by a third-party service you’re paying hundreds of dollars a month for.

An AI agent coupled with a small web service can do everything a CI platform does: receive a webhook, run the tests, interpret the results, and deploy. Fewer moving parts, faster feedback, and zero YAML. It’s the same loop we had in 2010 when guard popped up a notification on Snow Leopard. It’s just that now the machine watching your tests actually understands them.

The tools got complicated for a while. They don’t have to stay that way.