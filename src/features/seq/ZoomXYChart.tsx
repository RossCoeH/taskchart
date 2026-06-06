import { Zoom } from "@visx/zoom";
import { localPoint } from '@visx/event'
import { TransformMatrix } from '@visx/zoom/lib/types'
import React from "react";
import { Group } from "@visx/group";

import { AxisLeft, AxisBottom } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';

import { XYChart, Axis, LineSeries, Grid } from "@visx/xychart";
import { scaleLinear, scaleOrdinal } from "@visx/scale";

interface TaskData {
  id: string;
  name: string;
  duration: number;
  startTime: number;
}

const ZoomComponent = Zoom as unknown as React.ComponentType<any>;

export const ZoomXYChart = () => {
  const chartWidth = 800;
  const chartHeight = 600;
  const leftPanelWidth = 250;
  const rowHeight = 40;

  const initialTransform = {
    scaleX: 1,
    scaleY: 1,
    translateX: 0,
    translateY: 0,
    skewX: 0,
    skewY: 0
  };

  // Sample task data
  const tasks: TaskData[] = [
    { id: '1', name: 'Task A', duration: 5, startTime: 0 },
    { id: '2', name: 'Task B', duration: 3, startTime: 2 },
    { id: '3', name: 'Task C', duration: 7, startTime: 1 },
    { id: '4', name: 'Task D', duration: 4, startTime: 5 },
    { id: '5', name: 'Task E', duration: 6, startTime: 3 },
  ];

  // Chart data points for visualization
  const chartData = tasks.map(task => ({
    x: task.startTime,
    y: task.id,
    name: task.name
  }));


  // Scales for the chart (NOT affected by zoom)
  const xScale = scaleLinear<number>({
    domain: [0, 15], // Time domain in seconds
    range: [0, chartWidth]
  });

  const yScale = scaleOrdinal<string, number>({
    domain: tasks.map(t => t.id),
    range: tasks.map((_, i) => i * rowHeight)
  });

  return (
    <div style={{ display: 'flex', fontFamily: 'Arial, sans-serif' }}>
      {/* LEFT PANEL - Fixed columns */}
      <div
        style={{
          width: leftPanelWidth,
          height: chartHeight,
          borderRight: '1px solid #ccc',
          overflow: 'hidden',
          backgroundColor: '#f5f5f5'
        }}
      >
        {/* Column Headers */}
        <div
          style={{
            display: 'flex',
            height: rowHeight,
            borderBottom: '2px solid #999',
            fontWeight: 'bold',
            backgroundColor: '#e0e0e0'
          }}
        >
          <div style={{ flex: 1, padding: '8px', borderRight: '1px solid #ccc', overflow: 'hidden' }}>Name</div>
          <div style={{ flex: 1, padding: '8px', borderRight: '1px solid #ccc', overflow: 'hidden', textAlign: 'center' }}>Duration</div>
          <div style={{ flex: 1, padding: '8px', overflow: 'hidden', textAlign: 'center' }}>Start</div>
        </div>

        {/* Row Data */}
        <div style={{ height: chartHeight - rowHeight, overflow: 'hidden' }}>
          {tasks.map((task, idx) => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                height: rowHeight,
                borderBottom: '1px solid #ddd',
                backgroundColor: idx % 2 === 0 ? '#fafafa' : '#ffffff'
              }}
            >
              <div style={{ flex: 1, padding: '8px', borderRight: '1px solid #ddd', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {task.name}
              </div>
              <div style={{ flex: 1, padding: '8px', borderRight: '1px solid #ddd', overflow: 'hidden', textAlign: 'center' }}>
                {task.duration}s
              </div>
              <div style={{ flex: 1, padding: '8px', overflow: 'hidden', textAlign: 'center' }}>
                {task.startTime}s
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL - Zoomable chart */}
      <ZoomComponent
        width={chartWidth}
        height={chartHeight}
        scaleXMin={1}
        scaleXMax={5}
        scaleYMin={1}
        scaleYMax={1}
        initialTransformMatrix={initialTransform}
      >
        {(zoom) => (
          <div style={{ position: 'relative' }}>
            <svg
              width={chartWidth}
              height={chartHeight}
              style={{
                cursor: zoom.isDragging ? "grabbing" : "grab"
              }}
            >
              <defs>
                <clipPath id="clip-chart">
                  <rect width={chartWidth} height={chartHeight} />
                </clipPath>
              </defs>

              {/* Background */}
              <rect width={chartWidth} height={chartHeight} fill="#fff" />

              {/* Grid and axes - clipped to prevent overflow */}
              <g clipPath="url(#clip-chart)">
                {/* Horizontal grid lines for each task */}
                {tasks.map((task, idx) => (
                  <line
                    key={`grid-${task.id}`}
                    x1={0}
                    y1={idx * rowHeight + rowHeight / 2}
                    x2={chartWidth}
                    y2={idx * rowHeight + rowHeight / 2}
                    stroke="#e0e0e0"
                    strokeWidth={1}
                  />
                ))}

                {/* Task bars - zoomed horizontally */}
                <g transform={`translate(${zoom.transformMatrix.translateX}, 0) scale(${zoom.transformMatrix.scaleX}, 1)`}>
                  {tasks.map((task, idx) => {
                    const x = xScale(task.startTime);
                    const width = xScale(task.duration) - xScale(0);
                    return (
                      <rect
                        key={`bar-${task.id}`}
                        x={x}
                        y={idx * rowHeight + 5}
                        width={width}
                        height={rowHeight - 10}
                        fill="#4CAF50"
                        opacity={0.7}
                        stroke="#2E7D32"
                        strokeWidth={1}
                      />
                    );
                  })}
                </g>

                {/* X-axis labels - zoomed */}
                <g transform={`translate(${zoom.transformMatrix.translateX}, 0) scale(${zoom.transformMatrix.scaleX}, 1)`}>
                  {[0, 5, 10, 15].map((tick) => (
                    <g key={`tick-${tick}`} transform={`translate(${xScale(tick)}, 0)`}>
                      <line y1={chartHeight - 20} y2={chartHeight - 15} stroke="#666" />
                      <text y={chartHeight - 5} fontSize="12" textAnchor="middle">
                        {tick}s
                      </text>
                    </g>
                  ))}
                </g>

                {/* X-axis line */}
                <line x1={0} y1={chartHeight - 20} x2={chartWidth} y2={chartHeight - 20} stroke="#333" strokeWidth={2} />
              </g>

              {/* Interactive overlay for zoom/pan */}
              <rect
                width={chartWidth}
                height={chartHeight}
                fill="transparent"
                ref={zoom.containerRef}
                onMouseDown={zoom.dragStart}
                onMouseMove={zoom.dragMove}
                onMouseUp={zoom.dragEnd}
                onMouseLeave={() => {
                  if (zoom.isDragging) zoom.dragEnd();
                }}
                onDoubleClick={(event) => {
                  const point = localPoint(event) || { x: 0, y: 0 };
                  zoom.scale({ scaleX: 1.5, scaleY: 1, point });
                }}
              />
            </svg>
          </div>
        )}
      </ZoomComponent>
    </div>
  );
};