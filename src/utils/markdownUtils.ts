import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked for safety
marked.setOptions({
  breaks: true,
  gfm: true,
});

/**
 * Convert markdown to HTML
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  // Parse markdown to HTML
  const rawHtml = await marked(markdown);
  
  // Sanitize HTML to prevent XSS
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class']
  });
  
  return cleanHtml;
}

/**
 * Convert HTML to markdown (simplified)
 */
export function htmlToMarkdown(html: string): string {
  // Create a temporary div to parse HTML
  const div = document.createElement('div');
  div.innerHTML = DOMPurify.sanitize(html);
  
  let markdown = '';
  
  // Simple conversion - this is a basic implementation
  const convertNode = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();
      const children = Array.from(node.childNodes).map(convertNode).join('');
      
      switch (tagName) {
        case 'h1': return `# ${children}\n\n`;
        case 'h2': return `## ${children}\n\n`;
        case 'h3': return `### ${children}\n\n`;
        case 'h4': return `#### ${children}\n\n`;
        case 'h5': return `##### ${children}\n\n`;
        case 'h6': return `###### ${children}\n\n`;
        case 'p': return `${children}\n\n`;
        case 'br': return '\n';
        case 'strong':
        case 'b': return `**${children}**`;
        case 'em':
        case 'i': return `*${children}*`;
        case 'code': return `\`${children}\``;
        case 'pre': return `\`\`\`\n${children}\n\`\`\`\n\n`;
        case 'blockquote': return children.split('\n').map(line => `> ${line}`).join('\n') + '\n\n';
        case 'ul': return children + '\n';
        case 'ol': return children + '\n';
        case 'li': {
          const parent = element.parentElement;
          if (parent?.tagName.toLowerCase() === 'ul') {
            return `- ${children}\n`;
          } else if (parent?.tagName.toLowerCase() === 'ol') {
            const index = Array.from(parent.children).indexOf(element) + 1;
            return `${index}. ${children}\n`;
          }
          return children;
        }
        case 'a': {
          const href = element.getAttribute('href') || '#';
          return `[${children}](${href})`;
        }
        case 'img': {
          const src = element.getAttribute('src') || '';
          const alt = element.getAttribute('alt') || '';
          return `![${alt}](${src})`;
        }
        default: return children;
      }
    }
    
    return '';
  };
  
  markdown = Array.from(div.childNodes).map(convertNode).join('');
  
  // Clean up extra newlines
  markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();
  
  return markdown;
}

/**
 * Check if a string contains HTML
 */
export function isHtml(str: string): boolean {
  const htmlPattern = /<[^>]+>/;
  return htmlPattern.test(str);
}

/**
 * Strip HTML tags from a string
 */
export function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = DOMPurify.sanitize(html);
  return div.textContent || div.innerText || '';
}