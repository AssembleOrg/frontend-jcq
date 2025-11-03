import { Group, Select, ActionIcon, Text } from "@mantine/core";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "@/src/core/entities";

interface PaginationControlsProps {
  meta: PaginationMeta | null;
  currentPage: number;
  currentLimit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const LIMIT_OPTIONS = [
  { value: "20", label: "20 por página" },
  { value: "50", label: "50 por página" },
  { value: "100", label: "100 por página" },
];

export function PaginationControls({
  meta,
  currentPage,
  currentLimit,
  onPageChange,
  onLimitChange,
}: PaginationControlsProps) {
  return (
    <Group justify="space-between" align="center">
      <Group gap="xs">
        <Text size="sm" c="#9ca3af">
          Mostrando{" "}
          {meta
            ? `${(meta.page - 1) * meta.limit + 1} - ${Math.min(
                meta.page * meta.limit,
                meta.total
              )} de ${meta.total}`
            : "0 - 0 de 0"}
        </Text>
      </Group>

      <Group gap="md">
        <Select
          value={currentLimit.toString()}
          data={LIMIT_OPTIONS}
          onChange={(value) => onLimitChange(parseInt(value || "20"))}
          style={{ width: 150 }}
          styles={{
            input: {
              backgroundColor: "#1a1a1a",
              borderColor: "#2d2d2d",
              color: "white",
            },
          }}
        />

        <Group gap="xs">
          <ActionIcon
            variant="light"
            color="orange"
            disabled={!meta?.hasPreviousPage}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft size={16} />
          </ActionIcon>

          <Text
            size="sm"
            c="white"
            style={{ minWidth: 80, textAlign: "center" }}
          >
            Página {meta?.page || 1} de {meta?.totalPages || 1}
          </Text>

          <ActionIcon
            variant="light"
            color="orange"
            disabled={!meta?.hasNextPage}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRight size={16} />
          </ActionIcon>
        </Group>
      </Group>
    </Group>
  );
}


