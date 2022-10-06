import React, {
  createRef,
  MouseEvent,
  RefObject,
  useEffect,
  useState,
} from "react";
import classNames from "classnames";
import { getPosition, setCaretPosition } from "./twoColorCaretUtil";

import "./TwoColorsInput.module.scss";

export interface TwoColorsInputProps {
  color: string;
  startChars: string;
  endChars: string;
  value: string;
  placeholder?: string;
  wrapperClassName?: string;
  inputClassName?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onChange: (textValue: string) => void;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

const TwoColorsInput = (props: TwoColorsInputProps): JSX.Element => {
  const input: RefObject<HTMLSpanElement> = createRef();
  const [colorStartIndex, setColorStartIndex] = useState(-1);
  const [colorEndIndex, setColorEndIndex] = useState(-1);
 

  useEffect(() => {
    if (input.current && props.value.length > 0) {
      input.current.innerText = props.value;
      setStartEndIndexes();
    }
  }, []);

  useEffect(() => {
    updateColoredValue(false);
  }, [colorStartIndex]);

  const updateColoredValue = (withPosition?: boolean) => {
    const target = input.current;

    if (!target) {
      return;
    }

    const textValue = target.innerText;
    const pos = withPosition ? getPosition(target) : textValue.length + 1;
    let coloredValue = "";

//  console.log(`colorStartIndex, colorEndIndex`, colorStartIndex, colorEndIndex)
    if (colorStartIndex > 0 && colorStartIndex < target.innerHTML.length) {
      coloredValue = `${textValue.substring(0, colorStartIndex)}<font color="${
        props.color
      }">${textValue.substring(
        colorStartIndex,
        colorEndIndex > 0 ? colorEndIndex : undefined
      )}</font>`;
    }

    if (coloredValue && colorEndIndex > 0) {
      coloredValue += textValue.substring(colorEndIndex);
    }

    if (coloredValue) {
      target.innerHTML = coloredValue;
      if (input.current && pos) {
        setCaretPosition(input.current, pos);
      }
    }
  };

  const onInput = () => {
    if (!input.current || props.disabled) {
      return;
    }

    setStartEndIndexes();
    updateColoredValue(input.current.innerText.length > 0);
    props.onChange(input.current?.innerText);
  };

  const setStartEndIndexes = () => {
    if (!input.current) {
      return;
    }

    const textValue = input.current.innerText;
    if (textValue.length <= 0) {
      setColorStartIndex(-1);
      setColorEndIndex(-1);
      return;
    }

    const { startChars, endChars } = props;
    const startIndex = textValue.indexOf(startChars);
    const endIndex = textValue
      .substring(startIndex + startChars.length)
      .indexOf(endChars);

    if (startIndex >= 0) {
      setColorStartIndex(startIndex + startChars.length);
    }
    setColorEndIndex(
      endIndex >= 0 ? startIndex + startChars.length + endIndex : 0
    );
  };

  return (
    <div
      className={classNames("two-colors-input", props.wrapperClassName, {
        disabled: props.disabled,
      })}
      onClick={!props.disabled ? props.onClick : undefined}
    >
      <span
        ref={input}
        placeholder={props.placeholder}
        className={classNames("two-colors-input-value", props.inputClassName)}
        onInput={!props.disabled ? onInput : undefined}
        contentEditable={!props.disabled}
      />
    </div>
  );
};

export default TwoColorsInput;