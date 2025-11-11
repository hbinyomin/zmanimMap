// import $ from 'jquery';
import { modalDiv } from "./constants.js";

export function initializeAccordians() {

   const sectionHeadings = $('.collapsableTitle');
   for (let i = 0; i < sectionHeadings.length; i++) {
      $(sectionHeadings[i]).on('click', function () {
         $(this).toggleClass('opened');

         const content = $(this).nextAll();
         if (content.is(':hidden')) {
            content.show();
         } else { content.hide() }
      });
   }
}

export function initializeInstructions() {
   const instructions = $('#instructions');

   $('#instructionsButton').on('click', () => {
      instructions.show('fast');
      modalDiv.show();
   });

   $('#instructionsOk').on('click', () => {
      resetInstructions();
      instructions.hide();
      modalDiv.hide();
   });
}

function resetInstructions() {
   const sectionHeadings = $('.collapsableTitle.instructions');
   for (let i = 0; i < sectionHeadings.length; i++) {
      const heading = $(sectionHeadings[i]);
      heading.removeClass("opened");
      heading.next().hide();
   }
}
