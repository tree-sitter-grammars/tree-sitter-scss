package tree_sitter_scss_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	tree_sitter_scss "github.com/tree-sitter-grammars/tree-sitter-scss/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_scss.Language())
	if language == nil {
		t.Errorf("Error loading SCSS grammar")
	}
}
