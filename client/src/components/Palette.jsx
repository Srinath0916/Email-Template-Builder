import { useDrag } from 'react-dnd';
import { FiType, FiImage, FiSquare, FiMinus } from 'react-icons/fi';

const DraggableBlock = ({ type, label, icon: Icon, color, description }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'BLOCK',
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  });

  return (
    <div
      ref={drag}
      className={`
        bg-white border-2 border-gray-200 rounded-lg p-3 cursor-move transition-all hover:border-primary-300 hover:shadow-md
        ${isDragging ? 'opacity-50 scale-95' : ''}
      `}
      style={{ touchAction: 'none' }}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
      </div>
    </div>
  );
};

const Palette = () => {
  const blocks = [
    { type: 'text', label: 'Text', icon: FiType, color: 'bg-blue-100 text-blue-600', description: 'Can contain button' },
    { type: 'image', label: 'Image', icon: FiImage, color: 'bg-purple-100 text-purple-600', description: 'Can contain button' },
    { type: 'button', label: 'Button', icon: FiSquare, color: 'bg-orange-100 text-orange-600', description: 'Drop inside blocks' },
    { type: 'divider', label: 'Divider', icon: FiMinus, color: 'bg-green-100 text-green-600' }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Building Blocks
        </h3>
        <p className="text-xs text-gray-500">
          Drag blocks to canvas
        </p>
      </div>
      <div className="space-y-3">
        {blocks.map((block) => (
          <DraggableBlock key={block.type} {...block} />
        ))}
      </div>
    </div>
  );
};

export default Palette;
