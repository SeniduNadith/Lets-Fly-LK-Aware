import React from 'react';
// Import the previous dashboard app (renamed to App.old.jsx)
// This allows us to render the classic dashboard within our current routing/layout
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - importing JS module from TSX
import ClassicApp from '../../App.old.jsx';

const ClassicDashboardWrapper: React.FC = () => {
	return <ClassicApp />;
};

export default ClassicDashboardWrapper;
