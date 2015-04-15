---
layout: post
title: "Using JSCS and jscs-fixer for Atom.io"
date: "2015-04-15"
author: Fábio Oliveira
version: 1.0.4
---

In this post we'll take a brief look at JSCS and take a peak at jscs-fixer, an Atom.io package that allows you to automatically apply JSCS code-style rules to your scripts.

## Enter JSCS

If you don't know JSCS and decide to visit it's website, [jscs.info][jscs-site], you are greeted with the following description:

> JSCS is a code style linter for programmatically enforcing your style guide. You can configure JSCS for your project in detail using over 90 validation rules, including presets from popular style guides like jQuery, Airbnb, Google, and more.

I love using JSCS, mainly because it is a great way of making sure that all developers on a team are adhering to the same style guide and ensures that no-one gets to make their own choices regarding the code-style being used.

There are a couple of other tools that could be used in this process but they differ from JSCS, mainly:

* JSLint and JSHint, which both focus on ensuring best coding practices but don't offer any way of enforcing a given code-style, and

* ESLint, which allows for people to implement their own style rules. A good example of this would be Feross' **[standard][feross-standard]** module.

There's also a set of preset rules from different companies/projects/teams, the likes of which include Google, Airbnb, the jQuery and Grunt projects, and even a Node.js style guide, that you can use and customise via a .jscsrc file that you include in your project root referencing a preset and your tweaks to it, or even your own set of rules.

As for my personal taste, I usually use it as a [pre-commit hook][nunos-article], to ensure that no one commits and/or pushes code that doesn't conform to the chosen code-style. It helps enforce cohesion with your team or contributors, even more in this last case where you can potentially have dozens of contributions from different developers that could wreak havoc in your project. I also use JSCS directly in my editor, as you will see next.

##JSCS Fixer

Being a JSCS user and after reading an [article][addys-article] by [Addy Osmani][addys-profile] on JSCS' new auto-formatting feature and seeing his examples using the SublimeText editor and the SublimeLinter-JSCS plugin, I felt a little left behind since I'm an [Atom][atom-page] editor user.

Although I'm using the great **linter** and **linter-jscs** Atom packages, they don't (yet) offer a way of auto-formatting your scripts, which you have to do by hand, even if those packages help you to identify your code-style violations directly in your editor's workflow.

All things considered, I thought it would be cool if I developed an Atom package that would allow developers to format their scripts based on a project's style guide. Making this package would be the proverbial killing of two birds with one stone. <small>(Please keep in mind that no real birds were killed in the making of jscs-fixer).</small>

###Creating a package

First of all, the atom.io documentation pages are great regarding the editor's customisation and the how-to's for creating new themes or packages are also excellent.

I've followed the instructions on [this][atom-docs] page and as quickly as waiting on a new editor window to open, I had my first Atom package skeleton ready for me to hack on it.

>#### First-world problems

>If you browse through the package source you might not find Coffeescript as it would be expected from the examples provided on the atom.io documentation and from other Atom packages, it isn't that I dislike Coffeescript, but I feel much more comfortable writing "plain" Javascript.

###Meet jscs-fixer

My goal for this package was very simple: it would allow you to format (or fix) a file based on the rules defined on your `.jscsrc` file.

The simplest way to do it would be to run the `jscs` binary providing it with the `--fix` flag and the path to the file the user wants to fix.

To avoid dealing with the user having to configure the path to a system-wide `jscs` binary or developers having to add it as a local dependency on their project, the **jscs-fixer** package declares it as a dependency on it's *package.json* file, thus allowing the binary to be invoked directly from the _node\_modules_ folder instead of having to figure out where it is on the user system.

The package can be invoked with one of the following options

1. From Command Palette (<kbd>⌘</kbd>+<kbd>⌂</kbd>+<kbd>P</kbd>) invoke `jscs Fixer: Fix`
2. Right-click on one of the selected files and choose `Fix this file using jscs`
3. Use the keyboard shortcut - <kbd>ctrl</kbd>+<kbd>⌂</kbd>+<kbd>J</kbd>

![fix-it][fix-it-gif]

I do intend, in the near future, to add a settings view to the package that would allow a user to customise some details like the location of their prefered JSCS installation (either system-wide or project based) or to define the location of a `.jscsrc` or a default preset to use as a fallback.

###Closing notes

Of course, this package is open-source and the code can be found in its [repository][github-repo] and the [package page][atom-package], so go ahead and install it and start fixing your scripts automatically from within your editor.

*This post was cross-posted to the YLD! blog [here][yld-crosspost]. Please visit the website and previous posts on the blog.*

[jscs-site]: http://jscs.info/
[feross-standard]: https://github.com/feross/standard/blob/v3.6.0/rc/.eslintrc
[nunos-article]: http://blog.yld.io/2014/11/12/nano6-and-the-coverage-contract/
[addys-article]: https://medium.com/@addyosmani/auto-formatting-javascript-code-style-fe0f98a923b8
[addys-profile]: https://twitter.com/addyosmani
[atom-page]: https://atom.io/
[atom-docs]: https://atom.io/docs/latest/your-first-package
[scaffolding]: https://cldup.com/2KV3vDrkTl.png
[fix-it-gif]: https://cldup.com/Rmg6zIa3kS.gif
[github-repo]: https://github.com/foliveira/jscs-fixer
[atom-package]: https://atom.io/packages/jscs-fixer
[yld-crosspost]: http://blog.yld.io/2015/04/15/using-jscs-and-jscs-fixer-for-atom/
