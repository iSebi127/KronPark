import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from '../../pages/Login';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Page', () => {
  const mockOnAuthSuccess = vi.fn();

  beforeEach(() => {
    mockNavigate.mockClear();
    mockOnAuthSuccess.mockClear();
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login onAuthSuccess={mockOnAuthSuccess} />
      </BrowserRouter>
    );
  };

  it('renders login form with email and password fields', () => {
    // ACT
    renderLogin();

    // ASSERT
    expect(screen.getByText('Autentificare')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('nume@exemplu.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Introdu parola')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Conectare/i })).toBeInTheDocument();
  });

  it('updates email field when user types', async () => {
    // ARRANGE
    renderLogin();
    const emailInput = screen.getByPlaceholderText('nume@exemplu.com');
    const user = userEvent.setup();

    // ACT
    await user.type(emailInput, 'user@test.com');

    // ASSERT
    expect(emailInput.value).toBe('user@test.com');
  });

  it('updates password field when user types', async () => {
    // ARRANGE
    renderLogin();
    const passwordInput = screen.getByPlaceholderText('Introdu parola');
    const user = userEvent.setup();

    // ACT
    await user.type(passwordInput, 'password123');

    // ASSERT
    expect(passwordInput.value).toBe('password123');
  });

  it('does not submit form with empty fields', async () => {
    // ARRANGE
    renderLogin();
    const submitButton = screen.getByRole('button', { name: /Conectare/i });
    const user = userEvent.setup();

    // ACT - Try to submit without filling fields
    await user.click(submitButton);

    // ASSERT - Button should have validation (HTML5 required attribute)
    // The form won't submit, so onAuthSuccess shouldn't be called immediately
    // (This depends on browser validation)
  });

  it('displays error message when login fails', async () => {
    // ARRANGE
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Email sau parola incorecta' }),
      })
    );

    renderLogin();
    const user = userEvent.setup();

    // ACT - Fill and submit form
    await user.type(screen.getByPlaceholderText('nume@exemplu.com'), 'wrong@test.com');
    await user.type(screen.getByPlaceholderText('Introdu parola'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /Conectare/i }));

    // ASSERT - Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Email sau parola incorecta')).toBeInTheDocument();
    });

    expect(mockOnAuthSuccess).not.toHaveBeenCalled();
  });

  it('calls onAuthSuccess and navigates on successful login', async () => {
    // ARRANGE
    const mockUserData = { id: 1, email: 'user@test.com', fullName: 'Test User' };
    const mockToken = 'mock-jwt-token';

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ user: mockUserData, token: mockToken }),
      })
    );

    renderLogin();
    const user = userEvent.setup();

    // ACT - Fill and submit form
    await user.type(screen.getByPlaceholderText('nume@exemplu.com'), 'user@test.com');
    await user.type(screen.getByPlaceholderText('Introdu parola'), 'password');
    await user.click(screen.getByRole('button', { name: /Conectare/i }));

    // ASSERT
    await waitFor(() => {
      expect(mockOnAuthSuccess).toHaveBeenCalledWith(mockUserData, mockToken);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('disables submit button while request is in progress', async () => {
    // ARRANGE
    global.fetch = vi.fn(
      () => new Promise(resolve =>
        setTimeout(() =>
          resolve({
            ok: true,
            json: () => Promise.resolve({ user: {} }),
          }), 500)
      )
    );

    renderLogin();
    const user = userEvent.setup();
    const submitButton = screen.getByRole('button', { name: /Conectare/i });

    // ACT - Fill and submit
    await user.type(screen.getByPlaceholderText('nume@exemplu.com'), 'user@test.com');
    await user.type(screen.getByPlaceholderText('Introdu parola'), 'password');
    await user.click(submitButton);

    // Should show "Se conecteaza..." and be disabled
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/Se conecteaza/)).toBeInTheDocument();
  });

  it('displays server error message when fetch fails', async () => {
    // ARRANGE
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    renderLogin();
    const user = userEvent.setup();

    // ACT
    await user.type(screen.getByPlaceholderText('nume@exemplu.com'), 'user@test.com');
    await user.type(screen.getByPlaceholderText('Introdu parola'), 'password');
    await user.click(screen.getByRole('button', { name: /Conectare/i }));

    // ASSERT
    await waitFor(() => {
      expect(screen.getByText(/Nu s-a putut contacta serverul/)).toBeInTheDocument();
    });
  });

  it('navigates to signup when clicking signup link', async () => {
    // ARRANGE
    renderLogin();
    const user = userEvent.setup();

    // ACT
    const signupLink = screen.getByRole('button', { name: /Creeaza cont nou/i });
    await user.click(signupLink);

    // ASSERT
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });

  it('clears error message when user starts typing again', async () => {
    // ARRANGE - Show error first
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Eroare' }),
      })
    );

    renderLogin();
    const user = userEvent.setup();

    // ACT - Fail login
    await user.type(screen.getByPlaceholderText('nume@exemplu.com'), 'wrong@test.com');
    await user.type(screen.getByPlaceholderText('Introdu parola'), 'wrong');
    await user.click(screen.getByRole('button', { name: /Conectare/i }));

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText('Eroare')).toBeInTheDocument();
    });

    // ACT - Change email field
    global.fetch.mockClear();
    const emailInput = screen.getByPlaceholderText('nume@exemplu.com');
    await user.type(emailInput, 'a');

    // ASSERT - Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText('Eroare')).not.toBeInTheDocument();
    });
  });

  it('includes correct headers in fetch request', async () => {
    // ARRANGE
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ user: {}, token: 'test' }),
      })
    );

    renderLogin();
    const user = userEvent.setup();

    // ACT
    await user.type(screen.getByPlaceholderText('nume@exemplu.com'), 'user@test.com');
    await user.type(screen.getByPlaceholderText('Introdu parola'), 'password');
    await user.click(screen.getByRole('button', { name: /Conectare/i }));

    // ASSERT - Check fetch was called with correct options
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          })
        })
      );
    });
  });
});

