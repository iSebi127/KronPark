import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ParkingSpot from '../../components/ParkingSpot';

describe('ParkingSpot Component', () => {
  const mockSpot = {
    id: 'A1',
    status: 'free',
    type: 'standard'
  };

  it('renders parking spot with correct ID', () => {
    // ARRANGE - Create a mock click handler
    const handleClick = vi.fn();

    // ACT - Render the component
    render(
      <ParkingSpot
        spot={mockSpot}
        isSelected={false}
        onClick={handleClick}
      />
    );

    // ASSERT - Check the spot ID is displayed
    expect(screen.getByText('A1')).toBeInTheDocument();
  });

  it('renders available spot with correct styling', () => {
    // ARRANGE
    const handleClick = vi.fn();
    const availableSpot = { ...mockSpot, status: 'free' };

    // ACT
    const { container } = render(
      <ParkingSpot
        spot={availableSpot}
        isSelected={false}
        onClick={handleClick}
      />
    );

    // ASSERT - Check for emerald (green) styling for available spot
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-emerald-500/10');
  });

  it('renders occupied spot with red styling', () => {
    // ARRANGE
    const handleClick = vi.fn();
    const occupiedSpot = { ...mockSpot, status: 'occupied' };

    // ACT
    const { container } = render(
      <ParkingSpot
        spot={occupiedSpot}
        isSelected={false}
        onClick={handleClick}
      />
    );

    // ASSERT - Check for red styling
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-red-500/10');
  });

  it('renders reserved spot with amber styling', () => {
    // ARRANGE
    const handleClick = vi.fn();
    const reservedSpot = { ...mockSpot, status: 'reserved' };

    // ACT
    const { container } = render(
      <ParkingSpot
        spot={reservedSpot}
        isSelected={false}
        onClick={handleClick}
      />
    );

    // ASSERT - Check for amber styling
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-amber-500/10');
  });

  it('calls onClick handler when available spot is clicked', async () => {
    // ARRANGE
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <ParkingSpot
        spot={mockSpot}
        isSelected={false}
        onClick={handleClick}
      />
    );

    // ACT - Click the spot
    await user.click(screen.getByText('A1'));

    // ASSERT - Verify the handler was called
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when occupied spot is clicked', async () => {
    // ARRANGE
    const handleClick = vi.fn();
    const user = userEvent.setup();
    const occupiedSpot = { ...mockSpot, status: 'occupied' };

    render(
      <ParkingSpot
        spot={occupiedSpot}
        isSelected={false}
        onClick={handleClick}
      />
    );

    // ACT - Try to click (button is disabled)
    await user.click(screen.getByRole('button'));

    // ASSERT - Handler should NOT be called (button is disabled)
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('displays selected state with blue styling', () => {
    // ARRANGE
    const handleClick = vi.fn();

    // ACT
    const { container } = render(
      <ParkingSpot
        spot={mockSpot}
        isSelected={true}
        onClick={handleClick}
      />
    );

    // ASSERT - Check for blue selection styling
    const button = container.querySelector('button');
    expect(button).toHaveClass('ring-2');
    expect(button).toHaveClass('ring-blue-400');
  });

  it('displays special type icon for disabled spot', () => {
    // ARRANGE
    const handleClick = vi.fn();
    const disabledSpot = { ...mockSpot, type: 'disabled' };

    // ACT
    render(
      <ParkingSpot
        spot={disabledSpot}
        isSelected={false}
        onClick={handleClick}
      />
    );

    // ASSERT - Check for wheelchair icon
    expect(screen.getByText('♿')).toBeInTheDocument();
  });

  it('displays EV charging icon for EV spot', () => {
    // ARRANGE
    const handleClick = vi.fn();
    const evSpot = { ...mockSpot, type: 'ev' };

    // ACT
    render(
      <ParkingSpot
        spot={evSpot}
        isSelected={false}
        onClick={handleClick}
      />
    );

    // ASSERT - Check for EV icon
    expect(screen.getByText('⚡')).toBeInTheDocument();
  });

  it('sets data-cy attribute for Cypress testing', () => {
    // ARRANGE
    const handleClick = vi.fn();
    const spotWithId = { ...mockSpot, id: 'B5' };

    // ACT
    const { container } = render(
      <ParkingSpot
        spot={spotWithId}
        isSelected={false}
        onClick={handleClick}
      />
    );

    // ASSERT - Check data-cy attribute exists
    const button = container.querySelector('button');
    expect(button).toHaveAttribute('data-cy', 'parking-spot-B5');
  });

  it('sets data-status attribute correctly', () => {
    // ARRANGE
    const handleClick = vi.fn();
    const reservedSpot = { ...mockSpot, status: 'reserved' };

    // ACT
    const { container } = render(
      <ParkingSpot
        spot={reservedSpot}
        isSelected={false}
        onClick={handleClick}
      />
    );

    // ASSERT
    const button = container.querySelector('button');
    expect(button).toHaveAttribute('data-status', 'reserved');
  });
});

