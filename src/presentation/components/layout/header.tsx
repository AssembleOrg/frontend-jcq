"use client";

import { Bell } from "lucide-react";
import {
  Group,
  Title,
  Text,
  ActionIcon,
  Indicator,
  Box,
  Stack,
} from "@mantine/core";

interface HeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function Header({ title, description, action }: HeaderProps) {
  return (
    <Box
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        backgroundColor: "#0a0a0a",
        borderBottom: "1px solid #2d2d2d",
        padding: "1.5rem 2rem",
      }}
    >
      <Group justify="space-between" align="center">
        <Stack gap={4}>
          <Title order={2} c="white" size="1.75rem">
            {title}
          </Title>
          {description && (
            <Text size="sm" c="#9ca3af">
              {description}
            </Text>
          )}
        </Stack>

        <Group gap="md">
          {action}
          <Indicator color="#ff6b35" size={8} offset={4}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              radius="md"
              styles={{
                root: {
                  color: "#9ca3af",
                  "&:hover": {
                    backgroundColor: "#2d2d2d",
                    color: "white",
                  },
                },
              }}
            >
              <Bell size={20} />
            </ActionIcon>
          </Indicator>
        </Group>
      </Group>
    </Box>
  );
}
