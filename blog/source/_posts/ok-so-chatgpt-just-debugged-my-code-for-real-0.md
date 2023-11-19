---
title: OK, so ChatGPT just debugged my code. For real
tags:
  - AI
  - CyberSecurity
  - programming
  - tech
id: '777'
categories:
  - - coding
  - - News
  - - tech
  - - Tech Stuff
date: 2023-10-05 16:07:24
---

**Not only can ChatGPT write code, it can read code. On the one hand, that's very helpful.** **On the other hand, that's truly terrifying.**

![debugging](https://www.zdnet.com/a/img/resize/d9e06a782eb1ff80939303daf105c3d616269bb2/2023/04/03/87af347d-e30e-44b9-a0e4-ee914117a85b/debugging.jpg?auto=webp&width=740)

Programming is a constant game of mental Jenga: one line of code stacked upon another, building a tower of code you hope is robust enough not to come crashing down.

But it always does, as code never works the first time it's run. So, one of the key skills for any programmer is debugging -- the art and science of finding why code isn't running or is doing something unexpected or undesirable.

It's a little like being a detective, finding clues, and then finding out what those clues are trying to tell you. It's very frustrating and very satisfying, sometimes at exactly the same time.

I do a lot of debugging. It's not just because code never works the first time it's run. It's also because I use the debugging to tell me how the code is running, and then tweak it along the way.

But while good debugging does require its own special set of skills, it's also ultimately just programming. Once you find out why a block of code isn't working, you have to figure out how to write something that does work.

**Real-world ChatGPT testing**

This week, I was working on three coding tasks for software that I maintain. Two were fixes for bugs reported by users. One was a new piece of code to add a new feature. This was real, run-of-the-mill programming work for me. It was part of my regular work schedule.

I'm telling you that, because up until now, I've tested ChatGPT with test code. I've made up scenarios to see how well ChatGPT would work. This time, it was different. I was trying to get real work done, and decided to see if ChatGPT could be a useful tool to get that work done.

It's a different way to look at ChatGPT. Test scenarios are often a bit contrived and simplistic. Real-world coding is actually about pulling another customer support ticket off the stack and working through what made the user's experience go south.

So, with that, let's look at those tasks and see how ChatGPT performed.

**Rewriting regular expression code**

In coding, we have to find a lot of patterns in text. To do so, we use a form of symbolic math called regular expressions. I have been writing regular expressions for decades, and I still dislike doing so. It's tedious, error-prone, and arcane.

So, when a bug report came in telling me that a part of my code was only allowing integers when it should be allowing for dollars and cents (in other words, some number of digits, possibly followed by a period, and then if there was a period, followed by two more digits), I knew I'd need to use regular expression coding.

Since I find that process tedious and annoying, I decided to ask ChatGPT for help. Here's what I asked:

![regex-q](https://www.zdnet.com/a/img/resize/5ef834dde594c19f0e323b47fcf8b34e9c1f7626/2023/04/03/8aa20951-7945-47f7-bad2-815ffc2369ec/regex-q.jpg?auto=webp&width=740)

And here's the AI's very well-presented reply (click the little square to enlarge):

![regex-a](https://www.zdnet.com/a/img/resize/15768eb120ce5fca64187e37fe32e357b8b2de8e/2023/04/03/596ce6be-78f2-4f93-a297-964e756ff33d/regex-a.jpg?auto=webp&width=740)

I dropped ChatGPT's code into my function, and it worked. Instead of about two-to-four hours of hair-pulling, it took about five minutes to come up with the prompt and get an answer from ChatGPT.

**Reformatting an array**

Next up was reformatting an array. I like doing array code, but it's also tedious. So, I once again tried ChatGPT. This time the result was a total failure.

By the time I was done, I probably fed it 10 different prompts. Some responses looked promising, but when I tried to run the code, it errored out. Some code crashed; some code generated error codes. And some code ran, but didn't do what I wanted.

After about an hour, I gave up and went back to my normal technique of digging through GitHub and StackExchange to see if there were any examples of what I was trying to do, and then writing my own code.

Also: How to make ChatGPT provide sources and citations

So far, that's one win and one loss for the ChatGPT experience. But now I decided to raise the challenge.

**Actually finding the error in my code**

OK, so this next bit is going to be hard to explain. But think about the fact that if it's hard to explain to you (presumably a human and not one of the 50 or so bots that merely copy and republish my work on scammy, spammy websites), it is even more challenging to explain it to an AI.

I was writing new code. I had a function that took two parameters, and a calling statement that sent two parameters to my code. Functions are little black boxes that perform very specific functions and they are called (asked to do their magic) from lines of code running elsewhere in the program.

The problem I found was that I kept getting an error message.

The salient part of that message is where it states "1 passed" at one point and "exactly 2 expected" at another. I looked at the calling statement and the function definition and there were two parameters in both places.

W-the-ever-loving-F?

After about 15 minutes of deep frustration, I decided to throw the problem to the AI to see if it could help. So, I wrote the following prompt:

![untitled-2023-04-03-00-15-11](https://www.zdnet.com/a/img/resize/d2e348a1e3455bc721503e4bec419dcd4c4b245d/2023/04/03/640c8229-fad1-4700-8e76-bca68a95c398/untitled-2023-04-03-00-15-11.jpg?auto=webp&width=740)

I showed it the line of code that did the call, I showed it the function itself, and I showed it the handler, a little piece of code that dispatches the called function from a hook in my main program.

Within seconds, ChatGPT responded with this (click the little square to enlarge):

![error-with-apply-filters-in-wordpress-2023-04-01-04-02-10](https://www.zdnet.com/a/img/resize/e6ed430fc1f2231560b1524872fc2d0409b88987/2023/04/03/b93d9735-9fc0-4006-882a-3ce22902d075/error-with-apply-filters-in-wordpress-2023-04-01-04-02-10.jpg?auto=webp&width=740)

Just as it suggested, I updated the fourth parameter of the add\_filter() function to 2, and it worked!

ChatGPT took segments of code, analyzed those segments, and provided me with a diagnosis. To be clear, in order for it to make its recommendation, it needed to understand the internals of how WordPress handles hooks (that's what the add\_filter function does), and how that functionality translates to the behavior of the calling and the execution of lines of code.

I have to mark that achievement as incredible -- undeniably 'living in the future’ incredible.

**What does it all mean?**

As I mentioned earlier, debugging is a bit of art and a bit of science. Most good development environments include powerful debugging tools that let you look at the flow of data through the program as it runs, and this does help when trying to track down bugs.

But when you're stuck, it's often difficult to get help. That's because even a close colleague may not be familiar with the full scope of the code you're debugging. The program I'm working on consists of 153,259 lines of code across 563 files -- and as programs go, that's small.

Also: These experts are racing to protect AI from hackers

So, if I had wanted to get help from a colleague, I might have had to construct a request almost identical to the one I sent to ChatGPT.

But here's something to consider: I remembered to include the handler line even though I didn't realize that's where the error was. As a test, I also tried asking ChatGPT to diagnose my problem in a prompt where I didn't include the handler line, and it wasn't able to help. So, there are very definite limitations to what ChatGPT can do for debugging right now, in 2023.

Essentially, you have to know how to ask the right questions in the right way, and those questions need to be concise enough for ChatGPT to handle the whole thing in one query. That's something that takes actual programming knowledge and experience to know how to do.

**The potential cost of AI-assisted debugging**

Keep in mind that the AI doesn't replace all your other debugging tools. You'll still need to step through code, examine variable values, and understand how your code works. I found that ChatGPT can help identify areas to look at and provide some simple code blocks. In a way, it's a lot like using coding templates, except you don't have to pre-build those templates to incorporate them into your code. It's a helper, but it's not a coding replacement.

Could I have fixed the bug on my own? Of course. I've never had a bug I couldn't fix. But whether it would have taken two hours or two days (plus pizza, profanity, and lots of caffeine), while enduring many interruptions, that's something I don't know. I can tell you ChatGPT fixed it in minutes, saving me untold time and frustration.

ZDNET's Tiernan Ray recently published a fascinating article that cites a Texas Tech University study showing that AI performance in coding is still highly unreliable. Keep this in mind, because if AI is struggling to write complex code, it will have even more difficulty debugging complex code.

Most programmers have a range of debugging tools at their disposal and choose the tools they're going to use based on whatever problem they're currently trying to diagnose. There is no doubt that AI tools can be added to that toolbox. But be careful about overusing them. Because AI is essentially a black box, you're not able to see what process the AI undertakes to come to its conclusions. As such, you're not really able to check its work.

The potential cost of this is enormous. For traditional debugging tasks, the programmer is always able to see exactly what changes are being incorporated into the code. Even if those changes don't always work, the programmer is certainly aware of why those changes were attempted. But when relying on AI-based debugging --even in part -- the programmer is separated farther from the code, and that makes the resulting work product far harder to maintain. If it turns out there is a problem in the AI-generated code, the cost and time it takes to fix may prove to be far greater than if a human coder had done the full task by hand. 

As I showed above in my examples, AI coding tools can help (at least two times out of three). But they don't always work and they should never be relied on as a substitute for real understanding. Failure to remember that could be costly, indeed.

**Looking toward the (possibly dystopian) future**

I see a very interesting future, where it will be possible to feed ChatGPT all 153,000 lines of code and ask it to tell you what to fix. Microsoft (which owns GitHub) already has a public beta release of a Copilot tool for GitHub to help programmers build code. Microsoft has also invested billions of dollars in OpenAI, the makers of ChatGPT.

While the service might be limited to Microsoft's own development environments, I can see a future where the AI has access to all the code in GitHub, and therefore all the code in any project you post to GitHub.

Given how well ChatGPT identified my error from the code I provided, I can definitely see a future where programmers can simply ask ChatGPT (or a Microsoft-branded equivalent) to find and fix bugs in entire projects.

And here's where I take this conversation to a very dark place.

Imagine that you can ask ChatGPT to look at your GitHub repository for a given project, and have it find and fix bugs. One way could be for it to present each bug it finds to you for approval, so you can make the fixes.

But what about the situation where you ask ChatGPT to just fix the bugs, and you let it do so without bothering to look at all the code yourself? Could it embed something nasty in your code?

And what about the situation where an incredibly capable AI has access to almost all the world's code in GitHub repositories? What could it hide in all that code? What nefarious evil could that AI do to the world's infrastructure if it can access all our code?

Let's play a simple thought game. What if the AI was given Asimov's first rule as a key instruction. That's a "robot shall not harm a human, or by inaction allow a human to come to harm". Could it not decide that all our infrastructure was causing us harm? By having access to all our code, it could simply decide to save us from ourselves by inserting back doors that allowed it to, say, shut off the power grid, ground planes, and gridlock highways.

I am fully aware the scenario above is hyperbolic and alarmist. But it's also possible. After all, while programmers do look at their code in GitHub, it's not possible for anyone to look at all the lines in all their code.

As for me, I'm going to try not to think about it too much. I don't want to spend the rest of the 2020s in the fetal position rocking back and forth on the floor. Instead, I'll use ChatGPT to occasionally help me write and debug little routines, keep my head down, and hope future AIs don't kill us all in their effort to "not allow a human to come to harm.”