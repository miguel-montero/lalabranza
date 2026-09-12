<?php

namespace Labranza\Tests;

use Labranza\Capacity;
use PHPUnit\Framework\TestCase;

final class CapacityTest extends TestCase
{
    public function testFullCapacityWhenNoExistingReservations(): void
    {
        $this->assertSame(24, Capacity::remaining(24, []));
    }

    public function testSubtractsNonCancelledPartySizes(): void
    {
        $this->assertSame(14, Capacity::remaining(24, [4, 6]));
    }

    public function testNeverReturnsNegative(): void
    {
        $this->assertSame(0, Capacity::remaining(10, [8, 8]));
    }

    public function testZeroMaxCoversMeansNoCapacity(): void
    {
        $this->assertSame(0, Capacity::remaining(0, []));
    }
}
