import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import TextField from "./textField";

const meta: Meta<typeof TextField> = {
  title: "Components/TextField",
  component: TextField,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("");

    return (
      <TextField
        label="Name"
        name="name"
        placeholder="Enter your name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
};

export const WithError: Story = {
  render: () => {
    const [value, setValue] = useState("error value");

    return (
      <TextField
        label="Email"
        name="email"
        placeholder="Enter your email"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        error="Invalid email format"
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled Field",
    name: "disabled",
    value: "Can't edit",
    onChange: () => {},
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    label: "Read-only Field",
    name: "readonly",
    value: "Read-only value",
    onChange: () => {},
    readOnly: true,
  },
};
