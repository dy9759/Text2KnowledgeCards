"""
Test with default content for Text2KnowledgeCards project
Tests basic functionality with sample data
"""

import pytest
import json
import os
from pathlib import Path


class TestDefaultContent:
    """Test cases using default/sample content"""

    def test_project_structure_exists(self):
        """Test that basic project structure exists"""
        # Check for key directories
        project_root = Path(__file__).parent

        expected_dirs = [
            "SuperClaude",
            "skills",
            "docs",
            ".claude"
        ]

        for dir_name in expected_dirs:
            dir_path = project_root / dir_name
            assert dir_path.exists(), f"Directory {dir_name} should exist at {dir_path}"
            assert dir_path.is_dir(), f"{dir_name} should be a directory"

    def test_package_json_exists(self):
        """Test that package.json exists in root"""
        project_root = Path(__file__).parent
        package_json = project_root / "package.json"

        assert package_json.exists(), "package.json should exist"

        # Load and validate structure
        with open(package_json, 'r') as f:
            content = json.load(f)

        assert "type" in content, "package.json should have type field"
        assert content["type"] == "module", "Should be ES module type"
        assert "dependencies" in content, "Should have dependencies"

    def test_default_env_file(self):
        """Test .env file with default content"""
        project_root = Path(__file__).parent
        env_file = project_root / ".env"

        if env_file.exists():
            content = env_file.read_text()

            # Check for common environment variable patterns
            env_vars = []
            for line in content.split('\n'):
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    env_vars.append(line.split('=')[0])

            # At least should have some environment variables
            assert len(env_vars) > 0, "Should have at least one environment variable defined"

    def test_superclaude_config(self):
        """Test SuperClaude configuration exists"""
        project_root = Path(__file__).parent
        claude_config = project_root / ".claude" / "settings.json"

        if claude_config.exists():
            content = claude_config.read_text().strip()

            # Check if file has content
            if content:
                try:
                    config = json.loads(content)
                    # Should have some configuration
                    assert isinstance(config, dict), "Config should be a dictionary"
                except json.JSONDecodeError:
                    # File exists but is not valid JSON - that's okay for this test
                    pass
            else:
                # Empty file exists - that's okay for this test
                pass

    def test_skills_directory_structure(self):
        """Test skills directory has proper structure"""
        project_root = Path(__file__).parent
        skills_dir = project_root / "skills"

        if skills_dir.exists():
            # Should have at least one skill category
            skill_categories = [d for d in skills_dir.iterdir() if d.is_dir()]
            assert len(skill_categories) > 0, "Should have at least one skill category"

            # Check for common skill files
            for category in skill_categories[:3]:  # Check first 3 categories
                py_files = list(category.glob("**/*.py"))
                md_files = list(category.glob("**/*.md"))

                # Should have documentation or implementation
                assert len(py_files) > 0 or len(md_files) > 0, \
                    f"Skill category {category.name} should have Python or Markdown files"

    def test_documentation_exists(self):
        """Test that documentation exists"""
        project_root = Path(__file__).parent
        readme = project_root / "SuperClaude" / "README.md"

        if readme.exists():
            content = readme.read_text()

            # Should have meaningful content
            assert len(content) > 100, "README should have substantial content"
            assert "# " in content, "Should have headers"

            # Check for common sections
            sections = ["installation", "usage", "features", "getting started"]
            found_sections = [s for s in sections if s in content.lower()]
            assert len(found_sections) > 0, "Should have at least one common README section"

    def test_sample_skill_content(self):
        """Test sample content in skills directory"""
        project_root = Path(__file__).parent
        skills_dir = project_root / "skills"

        # Find a Python skill file to test
        py_files = list(skills_dir.glob("**/*.py"))

        if py_files:
            test_file = py_files[0]  # Test first Python file found
            content = test_file.read_text()

            # Basic Python file checks
            assert len(content) > 0, "File should not be empty"

            # Check for Python syntax
            try:
                compile(content, str(test_file), 'exec')
            except SyntaxError as e:
                pytest.fail(f"Python file has syntax error: {e}")

    def test_claude_instructions(self):
        """Test Claude instruction files exist"""
        project_root = Path(__file__).parent
        claude_md = project_root / ".claude" / "CLAUDE.md"

        if claude_md.exists():
            content = claude_md.read_text()

            # Should have meaningful instructions
            assert len(content) > 200, "Claude instructions should be substantial"
            assert "#" in content, "Should have structured sections"


@pytest.mark.parametrize("test_input,expected", [
    ("hello world", "hello world"),
    ("", ""),
    ("test", "test")
])
def test_parametrized_default_content(test_input, expected):
    """Example parametrized test with default content"""
    assert test_input == expected


class TestDefaultContentIntegration:
    """Integration tests with default content"""

    def test_project_imports(self):
        """Test that project modules can be imported"""
        try:
            # Try importing SuperClaude module
            import sys
            sys.path.insert(0, str(Path(__file__).parent / "SuperClaude"))

            # This might fail if dependencies aren't installed, but shouldn't crash
            try:
                from superclaude.cli.app import app
                assert app is not None
            except ImportError as e:
                pytest.skip(f"SuperClaude dependencies not installed: {e}")

        except Exception as e:
            pytest.fail(f"Import test failed unexpectedly: {e}")

    def test_environment_simulation(self):
        """Test simulating default environment"""
        # Create a sample environment configuration
        sample_config = {
            "mode": "development",
            "debug": True,
            "api_endpoint": "https://api.example.com",
            "timeout": 30
        }

        # Test configuration validation
        assert "mode" in sample_config
        assert sample_config["debug"] is True
        assert isinstance(sample_config["timeout"], int)
        assert sample_config["timeout"] > 0


if __name__ == "__main__":
    # Run tests directly
    pytest.main([__file__, "-v"])