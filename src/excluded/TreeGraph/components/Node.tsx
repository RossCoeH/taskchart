import { Group } from '@visx/group';
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';

import { colors } from './Colors';

export interface TreeNode {
	name: string;
	amount_transferred: number;
	lot_code: string;
	children?: TreeNode[] | undefined;
	isExpanded?: boolean | undefined;
}

export type HierarchyNode = HierarchyPointNode<TreeNode>;

export type NodeProps = {
	node: HierarchyNode;
	onNodeClick: (node: HierarchyNode) => void;
};

export type NodeStyle = {
	width: number;
	height: number;
	fontSize: number;
	textPadding: number;
	fill: string;
	stroke: string;
	strokeWidth: number;
	strokeDasharray: string;
	strokeOpacity: number;
	rx: number;
	textColor: string;
};

export default function Node({ node, onNodeClick }: NodeProps) {
	const defaultNodeStyle: NodeStyle = {
		width: 80,
		height: 40,
		fontSize: 9,
		textPadding: 3,
		fill: colors.background,
		stroke: colors.green,
		strokeWidth: 1,
		strokeDasharray: '2,2',
		strokeOpacity: 0.6,
		rx: 10,
		textColor: colors.green,
	};

	const parentNodeStyle: NodeStyle = {
		width: 80,
		height: 40,
		fontSize: 9,
		textPadding: 3,
		fill: colors.background,
		stroke: colors.blue,
		strokeWidth: 1,
		strokeDasharray: '',
		strokeOpacity: 1,
		rx: 0,
		textColor: colors.white,
	};

	const rootNodeStyle: NodeStyle = {
		width: 80,
		height: 40,
		fontSize: 9,
		textPadding: 3,
		fill: "url('#main')",
		stroke: '',
		strokeWidth: 0,
		strokeDasharray: '',
		strokeOpacity: 0,
		rx: 10,
		textColor: colors.background,
	};

	let nodeStyle = defaultNodeStyle;

	const isRoot = node.depth === 0;
	const isParent = !!node.data.children;

	// if (isRoot) return <RootNode node={node} onNodeClick={onNodeClick} />;
	// if (isParent) return <ParentNode node={node} onNodeClick={onNodeClick} />;
	if (isParent) {
		nodeStyle = parentNodeStyle;
	}
	if (isRoot) {
		nodeStyle = rootNodeStyle;
	}

	const centerX = -nodeStyle.width / 2;
	const centerY = -nodeStyle.height / 2;

	return (
		// eventually this will be fully customizable
		// and the rect will just be an overlay for handling the click event

		<Group top={node.x} left={node.y}>
			<rect
				height={nodeStyle.height}
				width={nodeStyle.width}
				y={centerY}
				x={centerX}
				fill={nodeStyle.fill}
				stroke={nodeStyle.stroke}
				strokeWidth={nodeStyle.strokeWidth}
				strokeDasharray={nodeStyle.strokeDasharray}
				strokeOpacity={nodeStyle.strokeOpacity}
				rx={nodeStyle.rx}
				// shouldn't need onClick here since it's a leaf node
				onClick={() => onNodeClick(node)}
			/>
			<text
				x={-(nodeStyle.width / 2 - 5)}
				y={
					-(nodeStyle.height / 3 - nodeStyle.fontSize * 0.75) -
					nodeStyle.textPadding +
					(nodeStyle.fontSize * 0.75) / 2
				}
				fontSize={nodeStyle.fontSize}
				fontFamily='Arial'
				textAnchor='start'
				fill={nodeStyle.textColor}
				style={{ pointerEvents: 'none' }}
			>
				Name: {node.data.name}
			</text>
			<text
				x={-(nodeStyle.width / 2 - 5)}
				y={0 + (nodeStyle.fontSize * 0.75) / 2}
				fontSize={nodeStyle.fontSize}
				fontFamily='Arial'
				textAnchor='start'
				fill={nodeStyle.textColor}
				style={{ pointerEvents: 'none' }}
			>
				Transferred: {node.data.amount_transferred}
			</text>
			<text
				x={-(nodeStyle.width / 2 - 5)}
				y={
					nodeStyle.height / 3 -
					nodeStyle.fontSize * 0.75 +
					nodeStyle.textPadding +
					(nodeStyle.fontSize * 0.75) / 2
				}
				fontSize={nodeStyle.fontSize}
				fontFamily='Arial'
				textAnchor='start'
				fill={nodeStyle.textColor}
				style={{ pointerEvents: 'none' }}
			>
				Lot Code: {node.data.lot_code}
			</text>
		</Group>
	);
}