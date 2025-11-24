export const exportToHTML = (blocks) => {
  const blockHTML = blocks.map(block => {
    const { type, content, src, styles } = block;

    switch (type) {
      case 'text':
        return `
          <tr>
            <td style="padding: 10px; color: ${styles.color}; font-size: ${styles.fontSize}; text-align: ${styles.textAlign};">
              ${content}
            </td>
          </tr>`;
      
      case 'image':
        return `
          <tr>
            <td style="padding: 10px;">
              <img src="${src}" alt="Email Image" style="max-width: 100%; height: auto; display: block;" />
            </td>
          </tr>`;
      
      case 'button':
        return `
          <tr>
            <td style="padding: 10px; text-align: ${styles.textAlign};">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: ${styles.backgroundColor}; padding: 12px 24px; border-radius: 4px;">
                    <a href="#" style="color: ${styles.color}; text-decoration: none; font-size: ${styles.fontSize}; font-weight: bold;">
                      ${content}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
      
      case 'divider':
        return `
          <tr>
            <td style="padding: 10px;">
              <hr style="border: none; border-top: 2px solid #ddd; margin: 0;" />
            </td>
          </tr>`;
      
      default:
        return '';
    }
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          ${blockHTML}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
