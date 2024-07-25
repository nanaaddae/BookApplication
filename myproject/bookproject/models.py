from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    """
    Extends the default Django User model.
    """
    email = models.EmailField(unique=True)

class Book(models.Model):
    """
    Model for a book.
    """
    title = models.CharField(max_length=200, null=False)
    author = models.CharField(max_length=200, null=False)
    first_publish_year = models.IntegerField(null=True)
    cover_url = models.URLField(max_length=500, null=True, blank=True)


class WishList(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist')
    books = models.ManyToManyField(Book, related_name='wishlists')
    date_added = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.username}'s Wishlist"


class ReadList(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='readlist')
    books = models.ManyToManyField(Book, related_name='readlists')
    date_added = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.username}'s Read List"