---
title: OK, so ChatGPT just debugged my code. For real
date: 2023-10-05 01:58:55
tags: tech
cover: https://i.imgur.com/MtYXUQn.jpg
---
Not only can ChatGPT write code, it can read code. On the one hand, that’s very helpful. On the other hand, that’s truly 
terrifying.

<a href="https://imgur.com/MtYXUQn"><img src="https://i.imgur.com/MtYXUQn.jpg" title="source: imgur.com" /></a>

Programming is a constant game of mental Jenga: one line of code stacked upon another, building a tower of code you hope 
is robust enough not to come crashing down.

But it always does, as code never works the first time it’s run. So, one of the key skills for any programmer is 
debugging — the art and science of finding why code isn’t running or is doing something unexpected or undesirable.

It’s a little like being a detective, finding clues, and then finding out what those clues are trying to tell you. It’s 
very frustrating and very satisfying, sometimes at exactly the same time.

I do a lot of debugging. It’s not just because code never works the first time it’s run. It’s also because I use the 
debugging to tell me how the code is running, and then tweak it along the way.

But while good debugging does require its own special set of skills, it’s also ultimately just programming. Once you 
find out why a block of code isn’t working, you have to figure out how to write something that does work.

Real-world ChatGPT testing

This week, I was working on three coding tasks for software that I maintain. Two were fixes for bugs reported by users. 
One was a new piece of code to add a new feature. This was real, run-of-the-mill programming work for me. It was part of 
my regular work schedule.

I’m telling you that, because up until now, I’ve tested ChatGPT with test code. I’ve made up scenarios to see how well 
ChatGPT would work. This time, it was different. I was trying to get real work done, and decided to see if ChatGPT could 
be a useful tool to get that work done.

 

It’s a different way to look at ChatGPT. Test scenarios are often a bit contrived and simplistic. Real-world coding is 
actually about pulling another customer support ticket off the stack and working through what made the user’s experience 
go south.

So, with that, let’s look at those tasks and see how ChatGPT performed.

 

Rewriting regular expression code

In coding, we have to find a lot of patterns in text. To do so, we use a form of symbolic math called regular 
expressions. I have been writing regular expressions for decades, and I still dislike doing so. It’s tedious, 
error-prone, and arcane.

So, when a bug report came in telling me that a part of my code was only allowing integers when it should be allowing 
for dollars and cents (in other words, some number of digits, possibly followed by a period, and then if there was a 
period, followed by two more digits), I knew I’d need to use regular expression coding.

 

Since I find that process tedious and annoying, I decided to ask ChatGPT for help. Here’s what I asked:
