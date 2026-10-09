/**
 * Component tests for ReadingListPage.
 * Verifies reading-list rendering and updating the read status.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ReadingListPage from './ReadingListPage';
import { useAuth } from '../context/useAuth';
import {
  getReadingList,
  updateReadingListStatus,
} from '../services/readingListService';

vi.mock('../context/useAuth');

vi.mock('../services/readingListService', () => ({
  getReadingList: vi.fn(),
  updateReadingListStatus: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const readingListItem = {
  id: 'book-1',
  title: 'Testboek',
  author: 'Test Auteur',
  description: 'Een testboek.',
  materialType: 'Boek',
  level: '2F',
  themes: ['Sport'],
  length: 'SHORT',
  isRead: false,
  addedByUserId: 'student-1',
  addedAt: new Date().toISOString(),
};

describe('ReadingListPage', () => {
  it('shows books from the reading list', async () => {
    vi.mocked(useAuth).mockReturnValue({
      accessToken: 'test-token',
    } as ReturnType<typeof useAuth>);

    vi.mocked(getReadingList).mockResolvedValue([
      readingListItem,
    ]);

    render(<ReadingListPage />);

    expect(
      await screen.findByText('Testboek'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Auteur: Test Auteur'),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'Markeer als gelezen',
      }),
    ).toBeInTheDocument();
  });

  it('changes a book from unread to read', async () => {
    const user = userEvent.setup();

    vi.mocked(useAuth).mockReturnValue({
      accessToken: 'test-token',
    } as ReturnType<typeof useAuth>);

    vi.mocked(getReadingList).mockResolvedValue([
      readingListItem,
    ]);

    vi.mocked(
      updateReadingListStatus,
    ).mockResolvedValue({
      bookId: 'book-1',
      isRead: true,
    });

    render(<ReadingListPage />);

    const button = await screen.findByRole(
      'button',
      {
        name: 'Markeer als gelezen',
      },
    );

    await user.click(button);

    expect(
      updateReadingListStatus,
    ).toHaveBeenCalledWith(
      'test-token',
      'book-1',
      {
        isRead: true,
      },
    );

    expect(
      await screen.findByRole('button', {
        name: 'Markeer als niet gelezen',
      }),
    ).toBeInTheDocument();
  });
});