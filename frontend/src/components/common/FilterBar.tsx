import React from 'react';
import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    SelectChangeEvent,
    Stack,
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';

interface FilterOption {
    value: string | number;
    label: string;
}

interface CustomFilter {
    type: 'text' | 'number' | 'date';
    label: string;
    value: string;
    onChange: (value: string) => void;
}

interface FilterBarProps {
    searchText: string;
    onSearchChange: (value: string) => void;
    dateFrom?: string;
    onDateFromChange?: (value: string) => void;
    dateTo?: string;
    onDateToChange?: (value: string) => void;
    filterOptions?: {
        value: string | number;
        options: FilterOption[];
        label: string;
        onChange: (value: string | number) => void;
    }[];
    customFilters?: CustomFilter[];
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
    customFilters = [],
    onClearFilters,
}) => {
    return (
        <Box sx={{ mb: 2, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <TextField
                    size="small"
                    label="Buscar"
                    variant="outlined"
                    value={searchText}
                    onChange={(e) => onSearchChange(e.target.value)}
                    sx={{ minWidth: 200 }}
                />

                {dateFrom !== undefined && onDateFromChange && (
                    <TextField
                        size="small"
                        label="Desde"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => onDateFromChange(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                )}

                {dateTo !== undefined && onDateToChange && (
                    <TextField
                        size="small"
                        label="Hasta"
                        type="date"
                        value={dateTo}
                        onChange={(e) => onDateToChange(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                )}

                {filterOptions.map((filter, index) => (
                    <FormControl key={index} size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>{filter.label}</InputLabel>
                        <Select
                            value={filter.value}
                            label={filter.label}
                            onChange={(e: SelectChangeEvent<string | number>) => 
                                filter.onChange(e.target.value)}
                        >
                            <MenuItem value="">Todos</MenuItem>
                            {filter.options.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ))}

                {customFilters.map((filter, index) => (
                    <TextField
                        key={index}
                        size="small"
                        label={filter.label}
                        type={filter.type}
                        value={filter.value}
                        onChange={(e) => filter.onChange(e.target.value)}
                        sx={{ minWidth: 120 }}
                    />
                ))}

                <IconButton onClick={onClearFilters} size="small">
                    <ClearIcon />
                </IconButton>
            </Stack>
        </Box>
    );
};

export default FilterBar; 