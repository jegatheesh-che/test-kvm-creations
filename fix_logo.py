import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Cache buster for style.css
    content = re.sub(r'href="css/style\.css(\?v=\d+)?"', r'href="css/style.css?v=4"', content)
    
    # Replace nav__logo content
    old_nav = r'<a href="home\.html" class="nav__logo">\s*<img src="assets/images/img1\.webp" alt="KVM Creations Studio" class="nav__logo-img" />\s*</a>'
    new_nav = '''<a href="home.html" class="nav__logo">
      <img src="assets/images/img1.webp" alt="KVM Creations Studio" class="nav__logo-img" />
      <div class="nav__logo-text-group">
        <span class="nav__logo-icon">KVM</span>
        <span class="nav__logo-text">Creations Studio</span>
      </div>
    </a>'''
    content = re.sub(old_nav, new_nav, content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
print("Updated HTML files.")
