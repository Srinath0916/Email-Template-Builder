import { exportToHTML } from '../htmlExport';

describe('HTML Export', () => {
  it('should export text block to HTML', () => {
    const blocks = [
      {
        id: '1',
        type: 'text',
        content: 'Hello World',
        styles: {
          color: '#000000',
          fontSize: '16px',
          textAlign: 'left'
        }
      }
    ];

    const html = exportToHTML(blocks);
    
    expect(html).toContain('Hello World');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('color: #000000');
  });

  it('should export button block to HTML', () => {
    const blocks = [
      {
        id: '1',
        type: 'button',
        content: 'Click Me',
        styles: {
          color: '#ffffff',
          backgroundColor: '#4CAF50',
          fontSize: '16px',
          textAlign: 'center'
        }
      }
    ];

    const html = exportToHTML(blocks);
    
    expect(html).toContain('Click Me');
    expect(html).toContain('background-color: #4CAF50');
  });

  it('should export image block to HTML', () => {
    const blocks = [
      {
        id: '1',
        type: 'image',
        src: 'https://example.com/image.jpg',
        styles: {}
      }
    ];

    const html = exportToHTML(blocks);
    
    expect(html).toContain('https://example.com/image.jpg');
    expect(html).toContain('<img');
  });

  it('should export divider block to HTML', () => {
    const blocks = [
      {
        id: '1',
        type: 'divider',
        content: '',
        styles: {}
      }
    ];

    const html = exportToHTML(blocks);
    
    expect(html).toContain('<hr');
  });

  it('should export multiple blocks', () => {
    const blocks = [
      {
        id: '1',
        type: 'text',
        content: 'Header',
        styles: { color: '#000000', fontSize: '24px', textAlign: 'center' }
      },
      {
        id: '2',
        type: 'divider',
        content: '',
        styles: {}
      },
      {
        id: '3',
        type: 'button',
        content: 'Action',
        styles: { color: '#ffffff', backgroundColor: '#2196F3', fontSize: '16px', textAlign: 'center' }
      }
    ];

    const html = exportToHTML(blocks);
    
    expect(html).toContain('Header');
    expect(html).toContain('Action');
    expect(html).toContain('<hr');
  });
});
