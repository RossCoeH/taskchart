import { translateMatrix, Zoom } from "@visx/zoom";
import { TransformMatrix } from "@visx/zoom/lib/types";
import useDragWithZoom from './indexZoomComb';

export type ZoomDragProps = {
  width: number;
  height: number;
};

const svgOriginalHeight = 100;
const svgOriginalWidth = 100;

const points = [
  {
    id: 1,
    x: 30,
    y: 10,
    color: "red"
  },
  {
    id: 2,
    x: 50,
    y: 60,
    color: "green"
  }
];

const Point = ({
  point,
  zoomTransformMatrix
}: {
  point: typeof points[number];
  zoomTransformMatrix?: TransformMatrix;
}) => {
  const {
    x,
    y,
    dx,
    dy,
    isDragging,
    dragStart,
    dragMove,
    dragEnd
  } = useDragWithZoom({
    x: point.x,
    y: point.y,
    snapToPointer: false,
    resetOnStart: true,
    zoomTransformMatrix
  });

  return (
    <>
      {isDragging && (
        <rect
          width={svgOriginalWidth}
          height={svgOriginalHeight}
          onPointerDown={dragStart}
          onPointerMove={dragMove}
          onPointerUp={dragEnd}
          fill="transparent"
        />
      )}
      <g
        onMouseMove={dragMove}
        onMouseUp={dragEnd}
        onMouseDown={dragStart}
        onTouchStart={dragStart}
        onTouchMove={dragMove}
        onTouchEnd={dragEnd}
        transform={`translate(${dx}, ${dy})`}
      >
        <circle cx={x} cy={y} r={2} fill={point.color} />
      </g>
    </>
  );
};

export default function ZoomDrag({ width, height }: ZoomDragProps) {
  if (!width && !height) return null;

  // initially zoom to fit container (leave 10% for padding)
  const initialScale =
    Math.min(width / svgOriginalWidth, height / svgOriginalHeight) * 0.9;

  const initialTransformMatrix = {
    // initially center svg
    translateX: width / 2 - (svgOriginalWidth * initialScale) / 2,
    translateY: height / 2 - (svgOriginalHeight * initialScale) / 2,
    scaleY: initialScale,
    scaleX: initialScale,
    skewX: 0,
    skewY: 0
  };

  return (
    <Zoom<SVGRectElement>
      width={width}
      height={height}
      initialTransformMatrix={initialTransformMatrix}
    >
      {(zoom) => {
        return (
          <>
            <svg width={width} height={height}>
              <g id="gym" transform={zoom.toString()}>
                <path id="background" d="M100 0H0V100H100V0Z" fill="#222222" />
              </g>
              <rect
                width={width}
                height={height}
                ref={zoom.containerRef}
                fill="transparent"
                style={{ touchAction: "none" }}
              />
              <g id="points" transform={zoom.toString()}>
                {points.map((p) => (
                  <Point
                    key={p.id}
                    point={p}
                    zoomTransformMatrix={zoom.transformMatrix}
                  />
                ))}
              </g>
            </svg>
          </>
        );
      }}
    </Zoom>
  );
}
