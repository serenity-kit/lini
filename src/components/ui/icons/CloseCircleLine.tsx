import React from "react";
import Svg, { Line } from "react-native-svg";

export type Props = { color: string; size: string };

export const CloseCircleLine = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 24 24">
      <Line stroke={color} strokeWidth="1" x1="18" y1="6" x2="6" y2="18" />
      <Line stroke={color} strokeWidth="1" x1="6" y1="6" x2="18" y2="18" />
    </Svg>
  );
};
