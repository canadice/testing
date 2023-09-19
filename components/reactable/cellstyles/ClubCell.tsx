import React from 'react';

const ClubCell = ({ value }) => {
    const renderClubs = (clubs) => {
        return clubs.map((club) => (
            <div key={club} style={{ display: 'inline-block', width: '25px' }}>
                <img src={`../teams/${club}.png`} style={{ height: '25px' }} alt={club} />
            </div>
        ));
    };

    if (value.includes(',')) {
        const clubs = value.split(',');
        return <div style={{ width: '50px' }}><React.Fragment>{renderClubs(clubs)}</React.Fragment></div>;
    } else {
        return (
            <div style={{ display: 'inline-block', width: '25px' }}>
                <img src={`../teams/${value}.png`} style={{ height: '25px' }} alt={value} />
            </div>
        );
    }
};

export default ClubCell;
