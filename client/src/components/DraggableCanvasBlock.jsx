import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { FiMove, FiTrash2, FiX } from 'react-icons/fi';

const DraggableCanvasBlock = ({ block, index, moveBlock, deleteBlock, isSelected, onClick, onAddChildButton, onRemoveChildButton }) => {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'CANVAS_BLOCK',
    item: { index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  });

  // Drop zone for reordering blocks
  const [, dropReorder] = useDrop({
    accept: 'CANVAS_BLOCK',
    hover: (item, monitor) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveBlock(dragIndex, hoverIndex);
      item.index = hoverIndex;
    }
  });

  // Drop zone for adding button inside image/text blocks
  const [{ isOverForButton, canDropButton }, dropButton] = useDrop({
    accept: 'BLOCK',
    canDrop: (item) => {
      return item.type === 'button' && (block.type === 'image' || block.type === 'text') && !block.childButton;
    },
    drop: (item) => {
      if (item.type === 'button' && (block.type === 'image' || block.type === 'text')) {
        onAddChildButton(block.id);
        return { dropped: true, nested: true };
      }
    },
    collect: (monitor) => ({
      isOverForButton: monitor.isOver(),
      canDropButton: monitor.canDrop()
    })
  });

  drag(dropReorder(dropButton(ref)));

  // Render the nested button below image/text
  const renderChildButton = () => {
    if (!block.childButton) return null;
    
    const { content, styles, url } = block.childButton;
    
    return (
      <div className="mt-4 text-center relative group/btn">
        <a
          href={url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: styles.backgroundColor,
            color: styles.color,
            fontSize: styles.fontSize,
          }}
          className="inline-block px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow hover:opacity-90"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </a>
        {url && url !== '#' && (
          <p className="text-xs text-gray-400 mt-2">🔗 {url}</p>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemoveChildButton(block.id);
          }}
          className="absolute -top-2 right-1/2 translate-x-1/2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-md z-10"
        >
          <FiX className="text-white" size={10} />
        </button>
      </div>
    );
  };

  const renderBlock = () => {
    const { type, content, src, styles } = block;

    switch (type) {
      case 'text':
        const isEmpty = !content || content === 'Enter your text here';
        return (
          <div>
            <div 
              contentEditable
              suppressContentEditableWarning
              data-placeholder="Enter your text here"
              onFocus={(e) => {
                // Clear placeholder text on focus
                if (isEmpty) {
                  e.currentTarget.textContent = '';
                }
              }}
              onBlur={(e) => {
                const newContent = e.currentTarget.textContent.trim();
                if (newContent && window.updateBlockContent) {
                  window.updateBlockContent(block.id, newContent);
                } else if (!newContent) {
                  // Reset to empty if no content
                  e.currentTarget.textContent = '';
                  if (window.updateBlockContent) {
                    window.updateBlockContent(block.id, '');
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              style={{ 
                color: styles.color, 
                fontSize: styles.fontSize, 
                textAlign: styles.textAlign 
              }}
              className="py-2 outline-none focus:ring-2 focus:ring-primary-300 rounded px-2 cursor-text min-h-[2em] relative"
            >
              {isEmpty ? '' : content}
            </div>
            {renderChildButton()}
          </div>
        );
      case 'image':
        return (
          <div className="text-center">
            <img 
              src={src} 
              alt="Block" 
              className="max-w-full rounded-lg shadow-md mx-auto"
            />
            {renderChildButton()}
          </div>
        );
      case 'button':
        return (
          <div style={{ textAlign: styles.textAlign }}>
            <a
              href={block.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: styles.backgroundColor,
                color: styles.color,
                fontSize: styles.fontSize,
              }}
              className="inline-block px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow hover:opacity-90"
              onClick={(e) => e.stopPropagation()}
            >
              {content}
            </a>
            {block.url && block.url !== '#' && (
              <p className="text-xs text-gray-400 mt-2">🔗 {block.url}</p>
            )}
          </div>
        );
      case 'divider':
        return <hr className="border-t-2 border-gray-300 my-4" />;
      default:
        return null;
    }
  };

  const canAcceptButton = (block.type === 'image' || block.type === 'text') && !block.childButton;

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`
        relative group rounded-xl p-4 transition-all cursor-pointer bg-white
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${isSelected 
          ? 'ring-2 ring-primary-500 bg-primary-50 shadow-md' 
          : 'hover:bg-gray-50 border border-gray-200 hover:shadow-sm'
        }
        ${isOverForButton && canDropButton ? 'ring-2 ring-orange-400 bg-orange-50' : ''}
      `}
    >
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 opacity-0 group-hover:opacity-100 transition-opacity z-40">
        <div className="w-6 h-6 bg-gray-700 rounded-lg flex items-center justify-center cursor-move shadow-md hover:bg-gray-800">
          <FiMove className="text-white" size={13} />
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          deleteBlock(block.id);
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        className="absolute right-3 top-3 w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 shadow-lg z-50"
        title="Delete block"
      >
        <FiTrash2 className="text-white" size={14} />
      </button>

      <div>
        {renderBlock()}
      </div>

      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-xs font-bold">✓</span>
        </div>
      )}

      {canAcceptButton && isOverForButton && canDropButton && (
        <div className="absolute inset-0 flex items-center justify-center bg-orange-100/80 rounded-xl border-2 border-dashed border-orange-400">
          <span className="text-orange-600 font-semibold text-sm">Drop button here</span>
        </div>
      )}

      {canAcceptButton && !isOverForButton && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full whitespace-nowrap">
            + Drop button
          </span>
        </div>
      )}
    </div>
  );
};

export default DraggableCanvasBlock;
