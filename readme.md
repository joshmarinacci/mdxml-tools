# MDXML Tools

This repo defines MDXML and contains tools to validate and render it.


Convert [`page.xml`](examples/onepage/page.xml) to `build/onepage/page.html`

```shell
npm run test-render-site
```



Definition of MDXML:

XML version of markdown, but without the rigorous schema, so it's easier to work with.

| Markdown        | MDXML                                              |
|-----------------|----------------------------------------------------|
| `#`             | `H1`                                               |
| `##`            | `H2`                                               |
| `some text`     | `<para>some text</para>`                           |
| `* list item`   | `<li>list item</li>`                               |
| `'code'`        | `<code>code</code>`                                |
| `*bold*`        | `<strong>bold</strong>`                            |
| `*italics*`     | `<emphasis>italics</emphasis>`                     |
| `[text](href)`  | `<link dest='href'>text</link>`                    |
| ` ''' lang '''` | `<codeblock language="lang">some code</codeblock>` |

Additions over HTML

* `<codeblock>`
* `<para>`
* `<document>`
* `<title>`
* `<metadata> <title/> <desc/> <screenshot/>`
* `<youtube>`
* `<supademo>`
* `<card> <title/><body/>`


# open questions

We focus on the semantics. How do we handle images? there are so many
different ways they can be used. photos, diagrams, 



