import React from 'react';

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => (
    <button
        type="button"
        aria-pressed={checked}
        className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4459FF] focus:ring-offset-2 focus:ring-offset-[#0A0A0A] ${
            checked ? 'bg-[#4459FF]' : 'bg-gray-600'
        }`}
        onClick={() => onChange(!checked)}
    >
        <span className="sr-only">Toggle setting</span>
        <span
            className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                checked ? 'translate-x-6' : 'translate-x-0'
            }`}
        />
    </button>
);

export default ToggleSwitch;
