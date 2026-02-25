import * as fs from 'fs';
import * as path from 'path';
import { marked } from 'marked';
import { buildHtmlPage } from './html-template';

export async function convertMarkdownToHtml(filePath: string): Promise<string> {
   const mdContent = fs.readFileSync(path.resolve(filePath), 'utf-8');
   const html = await marked(mdContent);
   return html;
}

export async function renderMarkdownPage(
   res: any,
   options: { title: string; markdownPath: string },
): Promise<void> {
   try {
      const html = withLinksOpenInNewTab(await convertMarkdownToHtml(options.markdownPath));
      res.type('html').send(buildHtmlPage(options.title, html));
   } catch (error) {
      res.status(500).type('text/plain').send(`Cannot render markdown: ${options.markdownPath}`);
   }
}

function withLinksOpenInNewTab(html: string): string {
   return html.replace(/<a\s+href=/g, '<a target="_blank" rel="noopener noreferrer" href=');
}
