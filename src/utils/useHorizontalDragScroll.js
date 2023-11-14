import { onMounted } from 'vue'

// https://stackoverflow.com/questions/28576636/mouse-click-and-drag-instead-of-horizontal-scroll-bar-to-view-full-content-of-c
export default function useHorizontalDragScroll (containerRef) {
  let mouseDown = false
  let startX, scrollLeft

  let startDragging = function (e) {
    const elem = containerRef.value
    // don't start dragging if click target is a link
    if (e.target?.tagName.toLowerCase() === 'a') {
      return
    }
    mouseDown = true
    startX = e.pageX - elem.offsetLeft
    scrollLeft = elem.scrollLeft
  }
  let stopDragging = function () {
    mouseDown = false;
  }

  onMounted(() => {
    const elem = containerRef.value
    if (!elem) { return }
    elem.addEventListener('mousemove', (e) => {
      e.preventDefault();
      if (!mouseDown) { return; }
      const x = e.pageX - elem.offsetLeft
      const scroll = x - startX
      elem.scrollLeft = scrollLeft - scroll
    });

    // Add the event listeners
    elem.addEventListener('mousedown', startDragging, false)
    elem.addEventListener('mouseup', stopDragging, false)
    elem.addEventListener('mouseleave', stopDragging, false)
  })

}
