import labels from './ko-labels.json'

// Only translate known display labels. IDs, status values and user-entered data stay intact.
export function koreanLabel(value) {
  return typeof value === 'string' ? (labels[value] ?? value) : value
}
