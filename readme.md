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
* `<link target='url'>text</link>`
* `<include src="path"/>`
* `<youtube id="long-id"/>`


# open questions

We focus on the semantics. How do we handle images? there are so many
different ways they can be used. photos, diagrams, 

How are links defined? <link target={url}/>

<iframe width="560" height="315" src="https://www.youtube.com/embed/MNzi0k5utkQ?si=gnLs2Hlf7HXD8lpk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
