// TODO //
// 1. Add html templating system to inject blog post into the template
// 2. Add CSS
// 3. When visiting home page, get a list of all of the posts under "blog" and put them in a list for the home page
//


import express from 'express';
const app = express();
app.use(express.static('public'));
const port = 3000;
import fs from 'fs';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkFrontmatter from 'remark-frontmatter';
import { visit } from 'unist-util-visit';
import yaml from 'js-yaml';

async function markdownToHtml(markdown) {
    let frontmatter = {};

    const processor = unified()
        .use(remarkParse) // Parse Markdown
        .use(remarkFrontmatter, ['yaml']) // Support YAML frontmatter
        .use(() => (tree) => {
            visit(tree, 'yaml', (node) => {
                frontmatter = yaml.load(node.value); // Extract YAML frontmatter
            });
        })
        .use(remarkRehype) // Convert Markdown AST to HTML AST
        .use(rehypeStringify); // Convert HTML AST to string

    const result = await processor.process(markdown);
    
    return {
        html: result.toString(),
        frontmatter
    };
}

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.get('/blog/:post', (req, res) => {
    const post = req.params.post;
    fs.readFile(`./blog/${post}.md`, "utf-8", (err, data) => {
        if (err) {
            return res.status(404).send("Post not found");
        }
        
        markdownToHtml(data).then(({html, frontmatter}) => {
            res.send(`<div class="blog-content">${html}</div>`);
            // console.log(frontmatter);
        });
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
