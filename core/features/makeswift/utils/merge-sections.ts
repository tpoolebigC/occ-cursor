// Makeswift Merge Sections Utility
// Utility functions for merging section data in Makeswift components

export function mergeSections(sections: any[]) {
  if (!sections || sections.length === 0) {
    return [];
  }

  return sections.reduce((merged, section) => {
    if (section && typeof section === 'object') {
      return { ...merged, ...section };
    }
    return merged;
  }, {});
} 