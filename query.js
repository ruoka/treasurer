/**
 * Treasurer (Rahuri) - DOM Query Utilities
 * 
 * Copyright (c) 2025 Kaius Ruokonen
 * Licensed under dual license: GPL-3.0 for non-profits, commercial license for others.
 * See LICENSE file for details.
 */

export const one = selectors => document.querySelector(selectors);
export const all = selectors => document.querySelectorAll(selectors);