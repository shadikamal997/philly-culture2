'use client';

import { useState } from 'react';

export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';

interface CourseFiltersProps {
  onFilterChange: (filters: {
    difficulty?: CourseDifficulty;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price-asc' | 'price-desc' | 'title' | 'newest';
  }) => void;
}

export default function CourseFilters({ onFilterChange }: CourseFiltersProps) {
  const [difficulty, setDifficulty] = useState<CourseDifficulty | ''>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'title' | 'newest'>('newest');

  const handleApplyFilters = () => {
    const filters: {
      difficulty?: CourseDifficulty;
      minPrice?: number;
      maxPrice?: number;
      sortBy?: 'price-asc' | 'price-desc' | 'title' | 'newest';
    } = {};
    
    if (difficulty) filters.difficulty = difficulty;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (sortBy) filters.sortBy = sortBy;

    onFilterChange(filters);
  };

  const handleReset = () => {
    setDifficulty('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    onFilterChange({});
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>

      <div className="space-y-4">
        {/* Difficulty Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as CourseDifficulty | '')}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium mb-2">Price Range</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'price-asc' | 'price-desc' | 'title' | 'newest')}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="newest">Newest First</option>
            <option value="title">Title (A-Z)</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleApplyFilters}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            Apply
          </button>
          <button
            onClick={handleReset}
            className="flex-1 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
