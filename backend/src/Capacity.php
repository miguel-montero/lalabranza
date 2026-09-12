<?php

namespace Labranza;

final class Capacity
{
    /**
     * @param int[] $existingPartySizes party sizes of non-cancelled
     *        reservations already booked for this restaurant/date/slot
     */
    public static function remaining(int $maxCovers, array $existingPartySizes): int
    {
        $booked = array_sum($existingPartySizes);
        return max(0, $maxCovers - $booked);
    }
}
