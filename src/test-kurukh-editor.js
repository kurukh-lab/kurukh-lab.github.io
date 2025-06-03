// Kurukh Editor Test Script
// This script tests the core functionality of the Microsoft Word-like editor

console.log('🎯 Testing Kurukh Dictionary Editor Features...');

// Test 1: Font Loading
function testFontLoading() {
  console.log('📝 Test 1: Checking font availability...');
  
  // Check if KellyTolong font is loaded
  const testElement = document.createElement('span');
  testElement.style.fontFamily = 'KellyTolong, monospace';
  testElement.textContent = 'Test';
  document.body.appendChild(testElement);
  
  const computedStyle = window.getComputedStyle(testElement);
  const fontFamily = computedStyle.fontFamily;
  
  document.body.removeChild(testElement);
  
  if (fontFamily.includes('KellyTolong')) {
    console.log('✅ KellyTolong font loaded successfully');
  } else {
    console.log('❌ KellyTolong font not loaded');
  }
  
  return fontFamily.includes('KellyTolong');
}

// Test 2: Editor Initialization
function testEditorInitialization() {
  console.log('📝 Test 2: Checking editor initialization...');
  
  const editorElement = document.querySelector('.tiptap-content');
  if (editorElement) {
    console.log('✅ Editor container found');
    return true;
  } else {
    console.log('❌ Editor container not found');
    return false;
  }
}

// Test 3: Toolbar Functionality
function testToolbarButtons() {
  console.log('📝 Test 3: Checking toolbar buttons...');
  
  const kurukhButton = document.querySelector('button[title*="Kurukh"]');
  const hindiButton = document.querySelector('button[title*="Hindi"]');
  
  if (kurukhButton && hindiButton) {
    console.log('✅ Language buttons found');
    return true;
  } else {
    console.log('❌ Language buttons not found');
    return false;
  }
}

// Test 4: Export Buttons
function testExportButtons() {
  console.log('📝 Test 4: Checking export functionality...');
  
  const pdfButton = document.querySelector('button:contains("Export PDF")');
  const htmlButton = document.querySelector('button:contains("Save HTML")');
  
  // Alternative search method
  const buttons = Array.from(document.querySelectorAll('button'));
  const pdfBtn = buttons.find(btn => btn.textContent.includes('Export PDF'));
  const htmlBtn = buttons.find(btn => btn.textContent.includes('Save HTML'));
  
  if (pdfBtn && htmlBtn) {
    console.log('✅ Export buttons found');
    return true;
  } else {
    console.log('❌ Export buttons not found');
    return false;
  }
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting Kurukh Editor Tests...\n');
  
  const results = {
    fontLoading: testFontLoading(),
    editorInit: testEditorInitialization(),
    toolbar: testToolbarButtons(),
    export: testExportButtons()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('Font Loading:', results.fontLoading ? '✅' : '❌');
  console.log('Editor Init:', results.editorInit ? '✅' : '❌');
  console.log('Toolbar:', results.toolbar ? '✅' : '❌');
  console.log('Export:', results.export ? '✅' : '❌');
  
  const allPassed = Object.values(results).every(test => test === true);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Kurukh Editor is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the implementation.');
  }
  
  return results;
}

// Auto-run tests when script loads
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
  } else {
    setTimeout(runAllTests, 1000); // Wait 1 second for components to load
  }
}

export { runAllTests, testFontLoading, testEditorInitialization, testToolbarButtons, testExportButtons };
