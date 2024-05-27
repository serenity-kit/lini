import React from "react";
import { More2Fill } from "./icons/More2Fill";

import { View } from "react-native";
import { CloseCircleLine } from "./icons/CloseCircleLine";

export type IconNames = "more-2-fill" | "close-circle-line";

export type IconProps = {
  name: IconNames;
  color?: string;
  size?: number | "full";
};

export const Icon = (props: IconProps) => {
  const { name } = props;
  const iconSize = "100%";
  const color = props.color || "#000000";
  // const size = 5;

  let icon: React.ReactNode = null;

  if (name === "more-2-fill") {
    icon = <More2Fill color={color} size={iconSize} />;
  } else if (name === "close-circle-line") {
    icon = <CloseCircleLine color={color} size={iconSize} />;
  }

  if (!icon) return null;

  return <View className="w-6 h-6">{icon}</View>;
};
