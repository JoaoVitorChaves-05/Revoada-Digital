# Requirements Document

## Introduction

Esta feature adiciona um botão de exclusão de post no fórum da comunidade, visível apenas para o autor do post ou para usuários com perfil de professor. O botão aparece em dois pontos de renderização: nos cards da lista de posts (ComunidadePostScreen) e no cabeçalho do post no detalhe (PostDetalheScreen).

A exclusão exige uma confirmação explícita por meio de um modal dedicado, exibe estado de carregamento durante a requisição e trata erros de forma visível. Após sucesso, a lista é recarregada e o detalhe navega de volta para a comunidade.

O escopo é exclusivamente frontend. O endpoint `DELETE /forum/posts/:id`, o serviço de exclusão e o hook de exclusão já existem e não são alterados por esta feature. A regra de permissão no frontend é apenas de experiência de usuário; a autorização efetiva permanece responsabilidade do backend.

## Glossary

- **Delete_Button**: Componente de botão de exclusão (`DeletePostButton`) renderizado em cada post, encapsulando permissão, confirmação e chamada de exclusão.
- **Permission_Helper**: Função pura `canDeletePost` que decide se o usuário logado pode excluir um post.
- **Confirm_Dialog**: Modal de confirmação reutilizável (`ConfirmDialog`) exibido antes de executar a exclusão.
- **List_Screen**: Tela de lista de posts da comunidade (`ComunidadePostScreen`).
- **Detail_Screen**: Tela de detalhe de um post (`PostDetalheScreen`).
- **Delete_Service**: Camada existente que executa a exclusão (`useDeletePost` sobre `forumService.deletePost`, chamando `DELETE /forum/posts/:id`).
- **Logged_User**: Usuário autenticado, identificado por `userId` e `profileType`.
- **Author**: Usuário cujo `userId` é igual ao `post.authorId` do post.
- **ProfileType**: Perfil do usuário, com valores `STUDENT`, `TEACHER` ou `ADMIN`.
- **Card_Navigation**: Comportamento de navegação do card da lista que abre o detalhe do post ao ser clicado.

## Requirements

### Requirement 1: Regra de permissão de exclusão

**User Story:** As a user of the forum, I want the delete action to be restricted to the post author and teachers, so that posts are only removed by people authorized to do so.

#### Acceptance Criteria

1. IF the Logged_User identifier is undefined, THEN THE Permission_Helper SHALL return boolean false.
2. WHEN the post author identifier is defined and strictly equals the Logged_User identifier, THE Permission_Helper SHALL return boolean true.
3. WHEN the Logged_User identifier is defined and the Logged_User ProfileType equals TEACHER, THE Permission_Helper SHALL return boolean true.
4. WHERE the Logged_User identifier is defined and the Logged_User ProfileType equals ADMIN, THE Permission_Helper SHALL return boolean true.
5. IF the Logged_User identifier is defined and the Logged_User is neither the post author nor has ProfileType equal to TEACHER nor ADMIN, THEN THE Permission_Helper SHALL return boolean false.
6. IF the Logged_User ProfileType is any value other than STUDENT, TEACHER, or ADMIN, THEN THE Permission_Helper SHALL return boolean false unless the Logged_User identifier strictly equals the post author identifier.
7. THE Permission_Helper SHALL return a value determined solely by the post author identifier, the Logged_User identifier, and the ProfileType, SHALL NOT mutate any of its arguments, and SHALL NOT perform network calls.

### Requirement 2: Visibilidade do botão de exclusão

**User Story:** As a user of the forum, I want to see the delete button only when I am allowed to delete the post, so that the interface reflects my permissions.

#### Acceptance Criteria

1. WHEN the List_Screen or Detail_Screen renders a post AND the Permission_Helper returns true for that post, THE Delete_Button SHALL render an interactive delete control associated with that post's identifier.
2. IF the Permission_Helper returns false for a post, THEN THE Delete_Button SHALL render no visible or interactive element for that post, producing an empty render output.
3. WHEN the List_Screen renders a post card, THE List_Screen SHALL mount exactly one Delete_Button in the footer region of that post card.
4. WHEN the Detail_Screen renders the displayed post, THE Detail_Screen SHALL mount exactly one Delete_Button in the author header region of that post.
5. IF the Permission_Helper returns a value that is not strictly true for a post, THEN THE Delete_Button SHALL treat the result as false and render no visible or interactive element for that post.

### Requirement 3: Confirmação antes da exclusão

**User Story:** As a user deleting a post, I want to confirm the action before it happens, so that I do not delete a post by accident.

#### Acceptance Criteria

1. WHEN the Logged_User activates the Delete_Button, THE Confirm_Dialog SHALL open within 300 milliseconds and display the confirm and cancel controls.
2. WHILE the Confirm_Dialog has not been confirmed by the Logged_User, THE Delete_Button SHALL NOT invoke the Delete_Service.
3. WHEN the Logged_User activates the confirm control in the Confirm_Dialog, THE Delete_Button SHALL invoke the Delete_Service exactly once with the identifier of the post being deleted.
4. WHEN the Logged_User activates the cancel control in the Confirm_Dialog, THE Confirm_Dialog SHALL close without invoking the Delete_Service and SHALL leave the post unchanged.
5. IF the Delete_Service invocation fails, THEN THE Confirm_Dialog SHALL display an error message indicating the deletion did not complete and SHALL leave the post unchanged.

### Requirement 4: Estado de carregamento durante a exclusão

**User Story:** As a user deleting a post, I want visual feedback while the deletion is in progress, so that I understand the request is being processed and I do not trigger it twice.

#### Acceptance Criteria

1. WHILE the useDeletePost loading boolean is true, THE Confirm_Dialog SHALL set the confirm control to a disabled, non-interactive state that ignores click and keyboard activation.
2. WHILE the useDeletePost loading boolean is true, THE Confirm_Dialog SHALL set the cancel control to a disabled, non-interactive state that ignores click and keyboard activation.
3. WHILE the useDeletePost loading boolean is true, THE Confirm_Dialog SHALL replace the confirm control label with a progress label reading "Excluindo...".
4. WHEN the useDeletePost loading boolean changes from true to false, THE Confirm_Dialog SHALL re-enable the confirm control and the cancel control and restore the confirm control's original label within 100 milliseconds.
5. WHILE the useDeletePost loading boolean is true, IF the confirm control is activated again by click or keyboard, THEN THE Confirm_Dialog SHALL ignore the activation and SHALL NOT initiate an additional Delete_Service request.

### Requirement 5: Tratamento de erro na exclusão

**User Story:** As a user deleting a post, I want to be told when a deletion fails, so that I can retry or cancel instead of assuming it succeeded.

#### Acceptance Criteria

1. IF the Delete_Service returns false indicating a failure, THEN THE Confirm_Dialog SHALL remain open with its confirm and cancel controls enabled.
2. IF the Delete_Service returns false indicating a failure, THEN THE Confirm_Dialog SHALL display the non-empty error string exposed by the Delete_Service within 1 second of the failure response.
3. IF the Delete_Service returns false indicating a failure, THEN THE Delete_Button SHALL NOT trigger a post list refresh.
4. IF the Delete_Service returns false indicating a failure, THEN THE Delete_Button SHALL NOT trigger navigation away from the current view.
5. WHILE a prior deletion failure error message is displayed, WHEN the user triggers the confirm control again, THE Confirm_Dialog SHALL clear the previously displayed error message before invoking the Delete_Service.

### Requirement 6: Resultado após exclusão bem-sucedida

**User Story:** As a user who deleted a post, I want the interface to update to reflect the removal, so that I see a consistent state after the action.

#### Acceptance Criteria

1. WHEN the Delete_Service reports success on the List_Screen, THE Delete_Button SHALL close the Confirm_Dialog within 300 milliseconds.
2. WHEN the Delete_Service reports success on the List_Screen, THE List_Screen SHALL invoke the post list refetch operation exactly once.
3. WHEN the Delete_Service reports success on the List_Screen, THE List_Screen SHALL remove the deleted post from the rendered list so that the deleted post is no longer displayed.
4. WHEN the Delete_Service reports success on the Detail_Screen, THE Delete_Button SHALL close the Confirm_Dialog within 300 milliseconds.
5. WHEN the Delete_Service reports success on the Detail_Screen, THE Detail_Screen SHALL invoke the back-navigation operation to the community screen exactly once.
6. IF the Delete_Service reports success more than once for the same delete action, THEN THE Delete_Button SHALL ignore all reports after the first and perform no additional dialog-close, refetch, or navigation operation.

### Requirement 7: Clique isolado no card da lista

**User Story:** As a user browsing the post list, I want clicking the delete button to not open the post, so that the delete and open actions do not interfere with each other.

#### Acceptance Criteria

1. WHEN the Logged_User activates the Delete_Button inside a post card, THE Delete_Button SHALL call stopPropagation on the click event before invoking any delete action.
2. WHEN the Logged_User activates the Delete_Button inside a post card, THE List_Screen SHALL NOT trigger Card_Navigation for that card and SHALL keep the List_Screen as the displayed view.
3. WHEN the Logged_User activates any area of a post card other than the Delete_Button, THE List_Screen SHALL trigger Card_Navigation to the detail view for that card.
4. IF activating the Delete_Button raises an error before stopPropagation completes, THEN THE List_Screen SHALL NOT trigger Card_Navigation for that card and SHALL remain on the List_Screen.

### Requirement 8: Propagação do perfil do usuário

**User Story:** As a developer integrating the feature, I want the logged user's profile type available to the forum screens, so that the permission rule can be evaluated at the render points.

#### Acceptance Criteria

1. WHEN the List_Screen is rendered AND a Logged_User is present, THE application root SHALL pass the Logged_User identifier and the Logged_User ProfileType to the List_Screen as defined values.
2. WHEN the Detail_Screen is rendered AND a Logged_User is present, THE application root SHALL pass the Logged_User identifier and the Logged_User ProfileType to the Detail_Screen as defined values.
3. WHEN the List_Screen is rendered AND no Logged_User is present, THE application root SHALL pass the identifier as undefined and the ProfileType as undefined to the List_Screen.
4. WHEN the Detail_Screen is rendered AND no Logged_User is present, THE application root SHALL pass the identifier as undefined and the ProfileType as undefined to the Detail_Screen.
5. THE application root SHALL pass the same Logged_User identifier and ProfileType values to the List_Screen and the Detail_Screen within a single render cycle.
