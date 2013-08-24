title: Models
prev: i18n
next: events
---
Hexo store everything in data model. It's very important for you to know what's inside the data model.

### Post

Name | Description
--- | ---
`id` | Post ID (Set by user)
`title` | Post title
`date` | Post date ([Moment.js] object)
`updated` | Post last updated date ([Moment.js] object)
`categories` | All categories of the post
`tags` | All tags of the post
`comments` | Comment enabled or not
`layout` | Layout name
`content` | The full processed content of the post
`excerpt` | The processed excerpt of the post
`source` | The path of the source file
`full_path` | Full path of the source file
`path` | The URL of the post without root URL
`permalink` | Full URL of the post
`crime` | File created time ([Moment.js] object)
`mtime` | File modified time ([Moment.js] object)
`original_content` | The raw data of the post

### Page

Name | Description
--- | ---
`title` | Page title
`date` | Page date ([Moment.js] object)
`updated` | Page last updated date ([Moment.js] object)
`comments` | Comment enabled or not
`layout` | Layout name
`content` | The full processed content of the page
`excerpt` | The processed excerpt of the page
`source` | The path of the source file
`full_path` | Full path of the source file
`path` | The URL of the page without root URL
`permalink` | Full URL of the page
`crime` | File created time ([Moment.js] object)
`mtime` | File modified time ([Moment.js] object)
`original_content` | The raw data of the page

### Category

Name | Description
--- | ---
`name` | Category name
`slug` | Category slug
`posts` | All posts in the category
`path` | The URL of the category without root URL
`permalink` | Full URL of the category
`length` | Total number of posts in the category

### Tag

Name | Description
--- | ---
`name` | Tag name
`slug` | Tag slug
`posts` | All posts in the tag
`path` | The URL of the tag without root URL
`permalink` | Full URL of the tag
`length` | Total number of posts in the tag

[Moment.js]: http://momentjs.com/