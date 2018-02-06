# Noise

##### February 9th, 2018


I'm starting to realize, as I get older, that a big key to happiness is understanding signal vs noise. As someone who has struggled off and on with anxiety, that isn't always easy. Finding the real signals is tough too. How do you manage to find the signals when you factor in the ebbs and flows of life (see my previous post)?

We often get in this same scenario with software. Just recently, I was mentoring a good friend / former colleague after he had a rough night of RDS outages. His startup (about ~3 engineers + business folks) tends to sees traffic in giant waves and he is always in fire fighter mode. Lately, he has also been struggling with _what_ fires to put out. If everything is on fire always, where do you start?

In situations like these, monitoring can be your best friend. My friend's company had invested next to nothing in montioring and, therefore, was unable to determine what fires were really fires. You need some noise to find the signals. A CloudWatch alert. An email notification. Really anything. 

My advice was to start with some basic RDS CPU (their biggest bottleneck) and ELB Request Count monitoring. Trigger an alert for some threshold (say when CPU goes over 50%) and use more monitoring to refine your alerts and hone in on the signals. 