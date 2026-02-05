import React from 'react';

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => {
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(!checked);
    };

    return (
        <div
            role="switch"
            aria-checked={checked}
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onChange(!checked);
                }
            }}
            className="relative inline-flex items-center cursor-pointer select-none"
            style={{ WebkitTapHighlightColor: 'transparent' }}
        >
            <div
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                    checked ? 'bg-[#4459FF]' : 'bg-gray-600'
                }`}
            >
                <div
                    className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                        checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                    style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}
                />
            </div>
        </div>
    );
};

export default ToggleSwitch;
