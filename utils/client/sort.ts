export function mergeSort<T>(arr: T[], sortMethod: (a: T, b: T) => number): T[] {
  if (arr.length <= 1) return arr

  const middle = Math.floor(arr.length / 2)
  const left = arr.slice(0, middle)
  const right = arr.slice(middle)

  return merge(mergeSort(left, sortMethod), mergeSort(right, sortMethod), sortMethod)
}

function merge<T>(left: T[], right: T[], sortMethod: (a: T, b: T) => number): T[] {
  const result: T[] = []
  let leftIndex = 0
  let rightIndex = 0

  while (leftIndex < left.length && rightIndex < right.length) {
    if (sortMethod(left[leftIndex], right[rightIndex]) < 0) {
      result.push(left[leftIndex++])
    } else {
      result.push(right[rightIndex++])
    }
  }

  // Add remaining elements from left or right arrays
  while (leftIndex < left.length) {
    result.push(left[leftIndex++])
  }
  while (rightIndex < right.length) {
    result.push(right[rightIndex++])
  }

  return result
}
