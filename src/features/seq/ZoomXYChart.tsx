import   {Zoom}  from "@visx/zoom";
import  {Point}  from "@visx/point";
import {localPoint} from '@visx/event'
import {TransformMatrix,ProvidedZoom,} from '@visx/zoom/lib/types'
import {identityMatrix} from '@visx/zoom/lib'
import React, { useRef, useState } from "react";
import { Group } from "@visx/group";


import { XYChart, Axis, LineSeries, Grid } from "@visx/xychart";
import { scaleLinear } from "@visx/scale";
const myRefContainer =useRef<HTMLDivElement>

// interface TransformMatrix{
//             scaleX: number;
//             scaleY: number;
//             translateX: number;
//             translateY: number;
//             skewX: number;
//             skewY: number;
//         };

export const ZoomXYChart =()=> {
  const width = 500;
  const height = width;
  const [showMiniMap, setShowMiniMap] = useState(true);

  const initialTransform = {
    scaleX: 1,
    scaleY: 1,
    translateX: 0,
    translateY: 0,
    skewX: 0,
    skewY: 0
  };
 interface Idata{x:number,y:number}

  const data:{x:number,y:number}[] = [
    { x: 1, y: 10 } ,
    { x: 2, y: 1 } ,
    { x: 3, y: 7 } ,
    { x: 5, y: 4 } ,
    { x: 5, y: 1 },
  ];

  const accessors = {
    xAccessor: (d:Point) => d.x,
    yAccessor: (d:Point) => d.y
  };

  function getScaledData(transformMatrix:TransformMatrix) {
    const scaleX = transformMatrix.scaleX;
    const scaleY = transformMatrix.scaleY;
    const xMovement = transformMatrix.translateX;
    const yMovement = transformMatrix.translateY;

    const realXVals = data.map((value:Idata) => value.x * scaleX);
    const realYVals = data.map((value:Idata) => value.y * scaleY);

    const xScale = scaleLinear({
      domain: [1, 5],
      range: [0, width / scaleX]
    });
    const yScale = scaleLinear({
      domain: [1, 10],
      range: [0, height / scaleY]
    });

    const scaledXVals = data.map(
      (value) => xScale(value.x) * scaleX + xMovement
    );
    const scaledYVals = data.map(
      (value) => yScale(value.y) * scaleY + yMovement
    );

    const newData = scaledXVals.map((val, index) => {
      const y = scaledYVals[index];
      return { x: val, y: y };
    });
    return newData;
  }


  return (
    // get error in line below of 'Zoom' cannot be used as a JSX component.
  //Its instance type 'Zoom' is not a valid JSX element.
  //  The types returned by 'render()' are incompatible between these types.
   //   Type '{} | null | undefined' is not assignable to type 'ReactNode'.
  //      Type '{}' is not assignable to type 'ReactNode'.
    <>
    <Zoom<SVGRectElement>
      width={width}
      height={height}
      scaleXMin={1}
      scaleXMax={2}
      scaleYMin={1}
      scaleYMax={2}
      initialTransformMatrix={initialTransform}
        >
      {(zoom) => {
      //  const reScaledData = getScaledData(zoom.transformMatrix);
        return (
          <div className="relative">
            <svg
              width={width??300}
              height={height??30}
              style={{
                cursor: zoom.isDragging ? "grabbing" : "grab"
              }}
         
            >
              <XYChart
                height={height}
                width={width}
                xScale={{ type: "linear" }}
                yScale={{ type: "linear" }}
                 
              >
                <rect width={width} height={height} fill={"#fff"}  
                   ref={zoom.containerRef}/>

                <Group>
                  <Group>
                    <Axis hideZero orientation="left" />
                    <Axis hideZero orientation="bottom" />
                    <Grid />
                  </Group>

                  <Group>
                    <LineSeries
                      transform={zoom.toString()}
                      data={data as Point[]}
                      dataKey="line"
                      height={height}
                      width={width}
                      
                      {...accessors}
                    />
                  </Group>
                </Group>
              </XYChart>

              <rect
                width={width}
                height={height}
                fill="transparent"
                onTouchStart={zoom.dragStart}
                onTouchMove={zoom.dragMove}
                onTouchEnd={zoom.dragEnd}
                onMouseDown={zoom.dragStart}
                onMouseMove={zoom.dragMove}
                onMouseUp={zoom.dragEnd}
                onMouseLeave={() => {
                  if (zoom.isDragging) zoom.dragEnd();
                }}
                onDoubleClick={(event) => {
                  const point = localPoint(event) || { x: 0, y: 0 };
                  zoom.scale({ scaleX: 1.1, scaleY: 1.1, point });
                }}
              />
            </svg>
          </div>
       
        )
      }
      } 
    </Zoom>
    </>
  );
};