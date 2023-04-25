import { ProvidedZoom } from '@visx/zoom/lib/types';

export type ControlsProps = {
	zoom: ProvidedZoom;
};

export default function Controls({ zoom }: ControlsProps) {
	return (
		<div className='controls'>
			<button
				type='button'
				className='btn btn-zoom'
				onClick={() => zoom.scale({ scaleX: 1.2, scaleY: 1.2 })}
			>
				+
			</button>
			<button
				type='button'
				className='btn btn-zoom btn-bottom'
				onClick={() => zoom.scale({ scaleX: 0.8, scaleY: 0.8 })}
			>
				-
			</button>
			<button type='button' className='btn btn-lg' onClick={zoom.reset}>
				Reset
			</button>
		</div>
	);
}