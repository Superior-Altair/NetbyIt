import React from 'react';
import {
    Box,
    TextField,
    Button,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';

interface FilterOption {
    value: string;
    options: { value: string; label: string }[];
    label: string;
    onChange: (value: string) => void;
}

interface NumericFilter {
    value: string;
    label: string;
    onChange: (value: string) => void;
}

interface FilterBarProps {
    searchText: string;
    onSearchChange: (value: string) => void;
    dateFrom?: string;
    onDateFromChange?: (value: string) => void;
    dateTo?: string;
    onDateToChange?: (value: string) => void;
    filterOptions?: FilterOption[];
    numericFilters?: NumericFilter[];
    onClearFilters: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
    searchText,
    onSearchChange,
    dateFrom,
    onDateFromChange,
    dateTo,
    onDateToChange,
    filterOptions = [],
    numericFilters = [],
    onClearFilters,
}) => {
    const showDateFilters = Boolean(onDateFromChange && onDateToChange);

    return (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                    size="small"
                    label="Buscar"
                    value={searchText}
                    onChange={(e) => onSearchChange(e.target.value)}
                    sx={{ minWidth: 200 }}
                />

                {showDateFilters && (
                    <>
                        <TextField
                            size="small"
                            label="Desde"
                            type="date"
                            value={dateFrom}
                            onChange={(e) => onDateFromChange?.(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            size="small"
                            label="Hasta"
                            type="date"
                            value={dateTo}
                            onChange={(e) => onDateToChange?.(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </>
                )}

                {filterOptions.map((filter, index) => (
                    <FormControl key={index} size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>{filter.label}</InputLabel>
                        <Select
                            value={filter.value}
                            label={filter.label}
                            onChange={(e) => filter.onChange(e.target.value)}
                        >
                            <MenuItem value="">Todos</MenuItem>
                            {filter.options.map((option, idx) => (
                                <MenuItem key={idx} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ))}

                {numericFilters.map((filter, index) => (
                    <TextField
                        key={index}
                        size="small"
                        label={filter.label}
                        type="number"
                        value={filter.value}
                        onChange={(e) => filter.onChange(e.target.value)}
                        sx={{ minWidth: 120 }}
                    />
                ))}

                <Button
                    variant="outlined"
                    onClick={onClearFilters}
                    sx={{ whiteSpace: 'nowrap' }}
                >
                    Limpiar Filtros
                </Button>
            </Stack>
        </Box>
    );
};

export default FilterBar; 