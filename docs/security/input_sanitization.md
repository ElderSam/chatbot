## Input sanitization

Here are examples of malicious inputs to test message field sanitization:

Simple HTML:  
``{ "message": "<b>bold</b>", ... }``

Malicious script:  
``{ "message": "<script>alert('hack');</script>", ... }``

Embedded JS event:  
``{ "message": "<img src='x' onerror='alert(1)'>", ... }``

Link with javascript:  
``{ "message": "<a href=\"javascript:alert('xss')\">click</a>", ... }``

Embedded style:  
``{ "message": "<style>body{background:red;}</style>", ... }``

Unknown tag:  
``{ "message": "<iframe src='evil.com'></iframe>", ... }``

These examples should be cleaned by your sanitization pipe, removing tags and scripts.
