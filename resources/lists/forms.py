from django import forms

#This form allows for proper password field to be used for profiles
class UserForm(forms.ModelForm):
    class Meta:
        model = Users
        widgets = {
        'password': forms.PasswordInput(),
    }