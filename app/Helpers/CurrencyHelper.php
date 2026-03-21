<?php

namespace App\Helpers;

class CurrencyHelper
{
    /**
     * Format a number as Philippine Peso currency
     *
     * @param float|int|null $amount
     * @return string
     */
    public static function formatPeso($amount = null)
    {
        if ($amount === null || $amount === 0) {
            return '₱0.00';
        }
        
        return '₱' . number_format($amount, 2, '.', ',');
    }
    
    /**
     * Format a number as Philippine Peso currency without symbol (for input fields)
     *
     * @param float|int|null $amount
     * @return string
     */
    public static function formatNumber($amount = null)
    {
        if ($amount === null || $amount === 0) {
            return '0';
        }
        
        return number_format($amount, 2, '.', ',');
    }
    
    /**
     * Parse a formatted currency string back to numeric value
     *
     * @param string $formattedAmount
     * @return float
     */
    public static function parseCurrency($formattedAmount)
    {
        if (empty($formattedAmount)) {
            return 0;
        }
        
        // Remove peso sign and commas, then convert to float
        $cleanAmount = preg_replace('/[₱,]/', '', $formattedAmount);
        
        return (float) $cleanAmount;
    }
}
