import React, { useState } from 'react';

const Tab = ({ label, activeTab, onClick }) => {
    const isActive = activeTab === label;
    return (
        <li
            className={`tab-item ${isActive ? 'active' : ''}`}
            onClick={() => onClick(label)}
        >
            {label}
        </li>
    );
};

const TabContent = ({ content }) => {
    return <div>{content}</div>;
};

const Tabs = ({ tabs }) => {
    if (tabs.length === 0) {
        return <div>No tabs to display</div>;
    }

    const [activeTab, setActiveTab] = useState(tabs[0].label);

    const handleTabClick = (tabLabel) => {
        setActiveTab(tabLabel);
    };

    return (
        <div className="tabs-container">
            <ul className="tabs">
                {tabs.map((tab) => (
                    <Tab
                        key={tab.label}
                        label={tab.label}
                        activeTab={activeTab}
                        onClick={handleTabClick}
                    />
                ))}
            </ul>
            <div className="tab-content">
                {tabs.map((tab) => (
                    activeTab === tab.label && (
                        <TabContent key={tab.label} content={tab.content} />
                    )
                ))}
            </div>
        </div>
    );
};

export default Tabs;
