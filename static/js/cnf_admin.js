(function($) {
    $(document).ready(function() {
        // Style the override sections with brand colors
        const primaryDark = '#1B1464';
        const goldAccent = '#786D3C';
        
        // Add styling to the override section
        $('.field-override_cnf_price, .field-override_fob_price, .field-override_total_cost_sdg, .field-override_total_cost_usd')
            .find('input[type="checkbox"]')
            .css({
                'margin-right': '10px',
                'transform': 'scale(1.2)',
                'accent-color': goldAccent
            });
        
        // Style the override fieldsets
        $('fieldset.wide').css({
            'border-left': `4px solid ${goldAccent}`,
            'padding-left': '15px',
            'margin-bottom': '20px',
            'background-color': '#f9f9f9',
            'border-radius': '0 5px 5px 0'
        });
        
        // Add visual feedback when override checkbox is checked
        $('input[id^="id_override_"]').change(function() {
            const relatedInputId = $(this).attr('id').replace('override_', 'new_');
            const $relatedInput = $('#' + relatedInputId);
            
            if ($(this).is(':checked')) {
                $relatedInput.css({
                    'border': `2px solid ${goldAccent}`,
                    'background-color': '#fffdf5',
                    'padding': '8px',
                    'border-radius': '4px'
                }).focus();
                
                // Add a visual indicator
                $relatedInput.parent().css({
                    'position': 'relative'
                });
                
                if ($relatedInput.parent().find('.override-indicator').length === 0) {
                    $relatedInput.parent().append(
                        `<span class="override-indicator" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: ${primaryDark}; font-weight: bold;">Override</span>`
                    );
                }
            } else {
                $relatedInput.css({
                    'border': '',
                    'background-color': '',
                    'padding': ''
                });
                $relatedInput.parent().find('.override-indicator').remove();
            }
        });
        
        // Initialize the state for any pre-checked boxes
        $('input[id^="id_override_"]:checked').each(function() {
            $(this).trigger('change');
        });
        
        // Add a history timeline visualization if there's a parent calculation
        if ($('#id_parent_calculation').length && $('#id_parent_calculation').val()) {
            const timelineContainer = $('<div class="calculation-timeline"></div>').css({
                'margin-top': '20px',
                'padding': '15px',
                'background-color': '#f5f5f5',
                'border-radius': '5px',
                'border-left': `5px solid ${goldAccent}`
            });
            
            const timelineTitle = $('<h3>Calculation History</h3>').css({
                'color': primaryDark,
                'margin-bottom': '15px',
                'font-size': '16px'
            });
            
            const timelineContent = $('<div class="timeline-content"></div>').css({
                'display': 'flex',
                'flex-direction': 'column',
                'gap': '10px'
            });
            
            // Add current calculation
            const currentItem = $('<div class="timeline-item current"></div>').css({
                'display': 'flex',
                'align-items': 'center',
                'padding': '10px',
                'background-color': '#fff',
                'border-radius': '4px',
                'border-left': `4px solid ${primaryDark}`
            });
            
            currentItem.html(`
                <span style="margin-right: 10px; color: ${primaryDark}; font-size: 18px;">●</span>
                <div>
                    <strong>Current Calculation</strong>
                    <div style="font-size: 12px; color: #666;">
                        ${$('#id_calculation_date').val() || 'Current'}
                    </div>
                </div>
            `);
            
            // Add parent calculation
            const parentItem = $('<div class="timeline-item parent"></div>').css({
                'display': 'flex',
                'align-items': 'center',
                'padding': '10px',
                'background-color': '#fff',
                'border-radius': '4px',
                'border-left': `4px solid ${goldAccent}`
            });
            
            parentItem.html(`
                <span style="margin-right: 10px; color: ${goldAccent}; font-size: 18px;">○</span>
                <div>
                    <strong>Previous Calculation</strong>
                    <div style="font-size: 12px; color: #666;">
                        Parent Record
                    </div>
                </div>
            `);
            
            timelineContent.append(currentItem).append(parentItem);
            timelineContainer.append(timelineTitle).append(timelineContent);
            
            // Add the timeline to the history fieldset
            $('fieldset:contains("History")').append(timelineContainer);
        }
        
        // Make the interface responsive
        function adjustResponsiveness() {
            if (window.innerWidth < 768) {
                $('.form-row').css({
                    'display': 'block'
                });
                
                $('.form-row > div').css({
                    'width': '100%',
                    'padding': '5px 0'
                });
            } else {
                $('.form-row').css({
                    'display': 'flex'
                });
                
                $('.form-row > div').css({
                    'width': '',
                    'padding': ''
                });
            }
        }
        
        // Call on page load and window resize
        adjustResponsiveness();
        $(window).resize(adjustResponsiveness);
    });
})(django.jQuery);
